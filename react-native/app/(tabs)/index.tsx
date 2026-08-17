import { useFocusEffect, useRouter } from 'expo-router';
import { Calendar, Lightbulb, Pencil, Plus, Star, Timer } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Dimensions, FlatList, Platform, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Checkbox,
    IconButton,
    Searchbar,
    Surface,
    Text,
    TextInput
} from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';
import { BRAND, NEUTRAL, RADIUS, SHADOWS, SURFACE } from '@/constants/theme';
import Task from '@/src/repo/Task';
import DraggableTaskList from '../../components/DraggableTaskList';
import TaskAddModal from '../../components/TaskAddModal';
import TaskEditModal from '../../components/TaskEditModal';
import TaskSectionNav from '../../components/TaskSectionNav';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web' && SCREEN_WIDTH > 768;

export default function TasksScreen() {
    const router = useRouter();
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [homePageTags, setHomePageTags] = useState<any[]>([]);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [addTaskTitle, setAddTaskTitle] = useState('');
    const [updatingTasks, setUpdatingTasks] = useState<string[]>([]);

    const handleTagClick = async (event: any, tag: any) => {
        const tagName = typeof tag === 'string' ? tag : tag.name;
        const isCtrlPressed = event?.nativeEvent?.ctrlKey || event?.nativeEvent?.metaKey;

        if (isCtrlPressed) {
            try {
                await Task.toggleTagHomePageOrder(tagName);
                fetchTasks();
            } catch (err) {
                console.error("Failed to toggle tag home page order", err);
            }
        } else {
            setSelectedTag(tagName);
        }
    };

    const handleRemoveHomePageTag = async (tagName: string) => {
        try {
            await Task.toggleTagHomePageOrder(tagName);
            fetchTasks();
        } catch (err) {
            console.error("Failed to remove tag from home page", err);
        }
    };

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await Task.list(activeFilter, selectedTag ? [selectedTag] : [], searchQuery);
            setTasks(res.data.data.tasks);
            if (res.data.data.home_page_tags) {
                setHomePageTags(res.data.data.home_page_tags);
            }
        } catch (err) {
            console.error("Failed to fetch tasks", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [searchQuery, activeFilter, selectedTag])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchTasks();
    };

    const handleDragEnd = (data: any[]) => {
        setTasks(data);
        Task.reorder(activeFilter, data.map((t: any) => t.id)).catch((err: any) => {
            console.error("Failed to persist task order", err);
        });
    };

    const toggleTaskStatus = async (task: any) => {
        const newStatus = task.status === '1' ? '0' : '1';
        setUpdatingTasks(prev => [...prev, task.id]);
        try {
            await Task.update(task.id, null, newStatus);
            await fetchTasks();
        } catch (err: any) {
            console.error("Failed to update task status", err);
        } finally {
            setUpdatingTasks(prev => prev.filter(id => id !== task.id));
        }
    };

    const toggleImportant = async (task: any) => {
        const newImportant = !task.is_important_flag;
        try {
            await Task.update(task.id, null, null, null, newImportant);
            fetchTasks();
        } catch (err: any) {
            console.error("Failed to update importance", err);
        }
    };

    const toggleMyDay = async (task: any) => {
        const newMyDay = !task.is_my_day;
        try {
            await Task.update(task.id, null, null, newMyDay);
            fetchTasks();
        } catch (err: any) {
            console.error("Failed to update my day", err);
        }
    };

    const openEditModal = (taskId: string) => {
        setSelectedTaskId(taskId);
        setEditModalVisible(true);
    };

    const handleAddTask = async () => {
        if (!addTaskTitle.trim()) return;
        try {
            await Task.create(addTaskTitle);
            setAddTaskTitle('');
            fetchTasks();
        } catch (err: any) {
            console.error("Failed to create task", err);
        }
    };

    const getAccentColor = (item: any) => {
        if (item.status === '1') return NEUTRAL[300];
        if (item.is_important_flag) return '#FFB900';
        return BRAND.primary;
    };

    const renderTaskItem = ({ item, index, isActive }: { item: any; index: number; isActive?: boolean }) => {
        const isUpdating = updatingTasks.includes(item.id);
        const accentColor = getAccentColor(item);

        return (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(280).springify()}>
                <Surface style={[styles.taskCard, isUpdating && { opacity: 0.6 }, isActive && styles.taskCardDragging]} elevation={0}>
                    {/* Left accent strip */}
                    <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />

                    <View style={styles.taskContent}>
                        <View style={styles.leftSection}>
                            {isUpdating ? (
                                <View style={{ width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }}>
                                    <ActivityIndicator size={18} color={BRAND.primary} />
                                </View>
                            ) : (
                                <Checkbox
                                    status={item.status === '1' ? 'checked' : 'unchecked'}
                                    onPress={() => toggleTaskStatus(item)}
                                    color={BRAND.primary}
                                />
                            )}
                        </View>

                        <View style={styles.textContainer}>
                            <Text
                                style={[
                                    styles.taskTitle,
                                    item.status === '1' && styles.completedTaskTitle,
                                    item.important_flag === '1' && styles.importantTaskTitle,
                                ]}
                                numberOfLines={2}
                            >
                                {item.title}
                            </Text>

                            <View style={styles.taskMeta}>
                                {item.due_date && item.due_date !== "null" && (
                                    <View style={styles.metaItem}>
                                        <Calendar size={12} color={NEUTRAL[500]} style={{ marginRight: 4 }} />
                                        <Text style={styles.metaText}>{item.due_date}</Text>
                                    </View>
                                )}
                                <View style={styles.tagsWrapper}>
                                    {item.planned_date && (
                                        <View style={styles.tagChip}>
                                            <Text style={styles.tagChipText}>{item.planned_date}</Text>
                                        </View>
                                    )}
                                    {item.from_time && (
                                        <View style={styles.tagChip}>
                                            <Text style={styles.tagChipText}>{item.from_time}</Text>
                                        </View>
                                    )}
                                    {item.estimate_text && (
                                        <View style={styles.tagChip}>
                                            <Text style={styles.tagChipText}>{item.estimate_text}</Text>
                                        </View>
                                    )}
                                    {item.tags && item.tags.map((tag: any, idx: number) => (
                                        <Pressable
                                            key={idx}
                                            onPress={(e) => handleTagClick(e, tag)}
                                            style={styles.tagChip}
                                        >
                                            <Text style={styles.tagChipText}>
                                                {typeof tag === 'string' ? tag : tag.name}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={styles.rightSection}>
                            <IconButton
                                icon={() => <Timer size={18} color={BRAND.primary} />}
                                onPress={() => router.push({
                                    pathname: '/pomodoro',
                                    params: { taskId: item.id, taskTitle: item.title }
                                })}
                                style={styles.actionIcon} />

                            <IconButton
                                icon={() => <Pencil size={18} color={NEUTRAL[500]} />}
                                onPress={() => openEditModal(item.id)}
                                style={styles.actionIcon} />

                            <IconButton
                                icon={() => (
                                    <Lightbulb
                                        size={18}
                                        color={item.is_my_day ? BRAND.primary : '#D1D5DB'}
                                    />
                                )}
                                onPress={() => toggleMyDay(item)}
                                style={styles.actionIcon} />

                            <IconButton
                                icon={() => (
                                    <Star
                                        size={18}
                                        color={item.is_important_flag ? "#FFB900" : '#D1D5DB'}
                                        fill={item.is_important_flag ? "#FFB900" : "transparent"}
                                    />
                                )}
                                onPress={() => toggleImportant(item)}
                                style={styles.actionIcon}
                            />
                        </View>
                    </View>
                </Surface>
            </Animated.View>
        );
    };

    const SECTION_LABELS: Record<string, string> = {
        'my_day': 'My Day',
        'important': 'Important',
        'planned': 'Planned',
        'task-history': 'History',
    };
    const getSectionTitle = () => {
        if (!activeFilter) return 'Tasks';
        if (activeFilter.startsWith('tag:')) return `# ${activeFilter.split('tag:')[1]}`;
        return SECTION_LABELS[activeFilter] || 'Tasks';
    };
    const sectionTitle = getSectionTitle();

    return (
        <ThemedView style={styles.container}>
            <View style={IS_WEB ? styles.webLayout : styles.mobileLayout}>
                <TaskSectionNav
                    activeFilter={activeFilter}
                    onFilterChange={(filter) => {
                        setActiveFilter(filter);
                        setSelectedTag(null);
                    }}
                    homePageTags={homePageTags}
                    onRemoveHomePageTag={handleRemoveHomePageTag}
                />

                <View style={styles.innerContainer}>
                    <View style={styles.fixedHeader}>
                        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
                        <Searchbar
                            placeholder="Search tasks..."
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            style={styles.searchBar}
                            inputStyle={{ color: '#000' }}
                            iconColor={BRAND.primary}
                            elevation={0}
                        />
                        {selectedTag && (
                            <View style={styles.filterTagBanner}>
                                <Text style={styles.filterTagText}>
                                    Filtered by: #{selectedTag}
                                </Text>
                                <Pressable
                                    onPress={() => setSelectedTag(null)}
                                    style={styles.clearFilterButton}
                                >
                                    <Text style={styles.clearFilterText}>Clear</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>

                    {activeFilter === 'task-history' ? (
                        <FlatList
                            data={tasks}
                            renderItem={renderTaskItem}
                            keyExtractor={(item) => item.id.toString()}
                            style={styles.taskFlatList}
                            contentContainerStyle={styles.listContent}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND.primary} />
                            }
                            ListEmptyComponent={
                                loading ? null : (
                                    <View style={styles.emptyState}>
                                        <Text style={{ color: NEUTRAL[500], fontSize: 15 }}>No tasks found</Text>
                                    </View>
                                )
                            }
                        />
                    ) : (
                        <DraggableTaskList
                            data={tasks}
                            renderItem={renderTaskItem}
                            keyExtractor={(item) => item.id.toString()}
                            onDragEnd={handleDragEnd}
                            style={styles.taskFlatList}
                            contentContainerStyle={styles.listContent}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND.primary} />
                            }
                            ListEmptyComponent={
                                loading ? null : (
                                    <View style={styles.emptyState}>
                                        <Text style={{ color: NEUTRAL[500], fontSize: 15 }}>No tasks found</Text>
                                    </View>
                                )
                            }
                        />
                    )}

                    {loading && !refreshing && (
                        <ActivityIndicator animating={true} color={BRAND.primary} style={styles.loader} />
                    )}

                    <View style={styles.fixedFooter}>
                        <Surface style={styles.addTaskContainer} elevation={0}>
                            <View style={styles.addTaskWrapper}>
                                <IconButton
                                    icon={() => <Plus color={BRAND.primary} size={24} />}
                                    onPress={() => setAddModalVisible(true)}
                                    style={styles.addIconBtn}
                                />
                                <TextInput
                                    placeholder="Add a task"
                                    value={addTaskTitle}
                                    onChangeText={setAddTaskTitle}
                                    onSubmitEditing={handleAddTask}
                                    style={styles.addTaskInput}
                                    textColor="#000"
                                    underlineColor="transparent"
                                    activeUnderlineColor="transparent"
                                    placeholderTextColor={NEUTRAL[500]}
                                />
                            </View>
                        </Surface>
                    </View>

                    <TaskAddModal
                        visible={addModalVisible}
                        onDismiss={() => setAddModalVisible(false)}
                        onTaskAdded={fetchTasks}
                    />

                    <TaskEditModal
                        visible={editModalVisible}
                        taskId={selectedTaskId}
                        onDismiss={() => {
                            setEditModalVisible(false);
                            setSelectedTaskId(null);
                        }}
                        onTaskUpdated={fetchTasks}
                    />
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: SURFACE.page,
    },
    webLayout: {
        flex: 1,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    mobileLayout: {
        flex: 1,
        overflow: 'hidden',
    },
    innerContainer: {
        flex: 1,
        maxWidth: '100%',
        alignSelf: 'center',
        width: IS_WEB ? 700 : '100%',
        height: '100%' as any,
        overflowY: 'auto' as any,
    },
    fixedHeader: {
        backgroundColor: SURFACE.page,
        zIndex: 1,
    },
    fixedFooter: {
        backgroundColor: SURFACE.page,
        zIndex: 1,
    },
    taskFlatList: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: NEUTRAL[900],
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 4,
        letterSpacing: -0.3,
    },
    searchBar: {
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: RADIUS.lg,
        backgroundColor: '#fff',
        ...Platform.select({
            web: { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' } as any,
            default: { elevation: 1 },
        }),
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 4,
    },
    taskCard: {
        marginBottom: 10,
        borderRadius: RADIUS.md,
        backgroundColor: '#fff',
        overflow: 'hidden',
        ...Platform.select({
            web: SHADOWS.web.card as any,
            default: SHADOWS.native.card,
        }),
    },
    taskCardDragging: {
        opacity: 0.85,
        ...Platform.select({
            web: { boxShadow: '0 4px 16px rgba(0,0,0,0.18)' } as any,
            default: { elevation: 6 },
        }),
    },
    accentStrip: {
        position: 'absolute',
        left: 0,
        top: 8,
        bottom: 8,
        width: 3,
        borderRadius: 2,
    },
    taskContent: {
        flexDirection: 'row',
        padding: 12,
        paddingLeft: 14,
    },
    leftSection: {
        paddingTop: 2,
        marginRight: 4,
    },
    textContainer: {
        flex: 1,
        paddingRight: 8,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: -4,
    },
    actionIcon: {
        margin: 0,
        width: 32,
        height: 32,
    },
    taskTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: NEUTRAL[900],
        lineHeight: 22,
    },
    completedTaskTitle: {
        textDecorationLine: 'line-through',
        color: NEUTRAL[500],
        opacity: 0.6,
    },
    importantTaskTitle: {
        color: '#FFB900',
    },
    taskMeta: {
        marginTop: 6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    metaText: {
        fontSize: 12,
        color: BRAND.primary,
        fontWeight: '500',
    },
    tagsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    tagChip: {
        backgroundColor: BRAND.primaryLight,
        borderRadius: RADIUS.pill,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    tagChipText: {
        fontSize: 11,
        color: BRAND.primary,
        fontWeight: '600',
    },
    addTaskContainer: {
        marginHorizontal: 16,
        marginBottom: 12,
        marginTop: 4,
        borderRadius: RADIUS.lg,
        backgroundColor: '#fff',
        overflow: 'hidden',
        ...Platform.select({
            web: { boxShadow: '0 -2px 12px rgba(98,100,167,0.10), 0 -1px 0 #E5E7EB' } as any,
            default: { elevation: 5, shadowColor: BRAND.primary, shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.10, shadowRadius: 8 },
        }),
    },
    addTaskWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    addIconBtn: {
        margin: 0,
    },
    addTaskInput: {
        flex: 1,
        backgroundColor: 'transparent',
        height: 52,
        fontSize: 14,
    },
    loader: {
        position: 'absolute',
        top: '50%',
        alignSelf: 'center',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    filterTagBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BRAND.primaryLight,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: RADIUS.pill,
        marginTop: 4,
        marginHorizontal: 16,
        marginBottom: 4,
        alignSelf: 'flex-start',
    },
    filterTagText: {
        fontSize: 13,
        color: BRAND.primary,
        fontWeight: '600',
    },
    clearFilterButton: {
        marginLeft: 8,
        backgroundColor: BRAND.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: RADIUS.pill,
    },
    clearFilterText: {
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
