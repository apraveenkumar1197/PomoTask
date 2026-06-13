import { Calendar, Clock, Lightbulb, Star, Trash2 } from 'lucide-react-native';

import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, IconButton, Modal, Portal, Text, TextInput } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { BRAND, NEUTRAL, RADIUS, SHADOWS, SURFACE } from '@/constants/theme';
import Task from '../src/repo/Task';
import { cancelReminder, scheduleReminder } from '../utils/notifications';
import { dateTimeCeilTo15Minutes } from '../utils/time';
import CustomDateTimePicker from './CustomDateTimePicker';

interface TaskEditModalProps {
    visible: boolean;
    taskId: string | null;
    onDismiss: () => void;
    onTaskUpdated: () => void;
}

export default function TaskEditModal({ visible, taskId, onDismiss, onTaskUpdated }: TaskEditModalProps) {
    const [title, setTitle] = useState('');
    const [important, setImportant] = useState(false);
    const [myDay, setMyDay] = useState(false);
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [fromTime, setFromTime] = useState<Date | null>(null);
    const [toTime, setToTime] = useState<Date | null>(null);
    const [reminder, setReminder] = useState<Date | null>(null);
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [allTags, setAllTags] = useState<any[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [goal, setGoal] = useState<any>(null);
    const [allGoals, setAllGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [status, setStatus] = useState('0');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showReminderPicker, setShowReminderPicker] = useState(false);
    const [showFromTimePicker, setShowFromTimePicker] = useState(false);
    const [showToTimePicker, setShowToTimePicker] = useState(false);

    const scale = useSharedValue(0.92);
    const opacity = useSharedValue(0);
    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    useEffect(() => {
        if (visible) {
            scale.value = withSpring(1, { damping: 20, stiffness: 200 });
            opacity.value = withTiming(1, { duration: 200 });
        } else {
            scale.value = 0.92;
            opacity.value = 0;
        }
    }, [visible]);

    useEffect(() => {
        if (visible && taskId) {
            fetchTaskData();
        } else if (!visible) {
            // Reset state when modal closes to ensure clean prefill on next open
            setDueDate(null);
            setShowDatePicker(false);
        }
    }, [visible, taskId]);

    const fetchTaskData = async () => {
        setFetching(true);
        try {
            // @ts-ignore
            const res = await Task.edit(taskId!);
            const { task, goals } = res.data.data;

            setTitle(task.title || '');
            setImportant(task.is_important_flag);
            setMyDay(task.add_to_my_day === '1');
            setDueDate(task.planned_date && task.planned_date !== "null" ? new Date(task.planned_date) : null);
            setFromTime(task.from_time ? new Date(`1970-01-01T${task.from_time}`) : null);
            setToTime(task.to_time ? new Date(`1970-01-01T${task.to_time}`) : null);
            setReminder(task.reminder_date_time ? new Date(task.reminder_date_time) : null);
            setNotes(task.notes || '');
            setTags(task.tags ? task.tags.map((t: any) => typeof t === 'string' ? t : t.name) : []);
            setGoal(task.goal);
            setStatus(task.status);

            console.log(`Due date ::: ${dueDate}`)

            const yearly = (goals.yearly_goals || []).map((g: any) => ({ ...g, type: 'Yearly' }));
            const monthly = (goals.monthly_goals || []).map((g: any) => ({ ...g, type: 'Monthly' }));
            setAllGoals([...monthly, ...yearly]);
            // Fetch all tags for autocomplete
            const tagRes = await Task.listTags();
            const tagsData = tagRes?.data?.data ?? tagRes?.data;
            setAllTags(tagsData);
        } catch (err) {
            console.error("Failed to fetch task data", err);
        } finally {
            setFetching(false);
        }
    };

    const handleUpdate = async () => {
        if (!title.trim() || !taskId) return;
        setLoading(true);
        try {

            await Task.update(
                taskId,
                title,
                status,
                myDay,
                important,
                dueDate?.toISOString().split('T')[0],
                fromTime?.toTimeString().split(' ')[0],
                toTime?.toTimeString().split(' ')[0],
                reminder?.toISOString(),
                notes,
                tags,
                goal
            );

            if (reminder) {
                await scheduleReminder(
                    taskId,
                    'Task Reminder',
                    title,
                    reminder
                );
            } else {
                await cancelReminder(taskId);
            }

            onTaskUpdated();
            onDismiss();
        } catch (err) {
            console.error("Failed to update task", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const performDelete = async () => {
            setLoading(true);
            try {
                // @ts-ignore
                await Task.delete(taskId!);
                await cancelReminder(taskId!);
                onTaskUpdated();
                onDismiss();
            } catch (err) {
                console.error("Failed to delete task", err);
            } finally {
                setLoading(false);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to delete this task?")) {
                performDelete();
            }
        } else {
            Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: performDelete }
            ]);
        }
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
                <Animated.View style={[styles.content, animStyle]}>
                    {fetching ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator color={BRAND.primary} />
                        </View>
                    ) : (
                        <>
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Edit Task</Text>
                                <View style={styles.headerActions}>
                                    <IconButton icon={() => <Trash2 size={20} color="#EA4335" />} onPress={handleDelete} />
                                    <IconButton icon="close" onPress={onDismiss} />
                                </View>
                            </View>

                            <ScrollView style={styles.form}>
                                <TextInput
                                    label="Title"
                                    value={title}
                                    onChangeText={setTitle}
                                    mode="outlined"
                                    style={styles.input}
                                    textColor="#000"
                                    outlineColor="#E0E0F0"
                                    activeOutlineColor={BRAND.primary}
                                />

                                <View style={styles.row}>
                                    <View style={styles.checkboxItem}>
                                        <IconButton
                                            icon={() => <Star size={20} color={important ? "#FFB900" : "#605E5C"} fill={important ? "#FFB900" : "transparent"} />}
                                            onPress={() => setImportant(!important)}
                                        />
                                        <Text style={{ color: NEUTRAL[900] }}>Important</Text>
                                    </View>
                                    <View style={styles.checkboxItem}>
                                        <IconButton
                                            icon={() => <Lightbulb size={20} color={myDay ? BRAND.primary : "#605E5C"} />}
                                            onPress={() => setMyDay(!myDay)}
                                        />
                                        <Text style={{ color: NEUTRAL[900] }}>My Day</Text>
                                    </View>
                                </View>

                                <View style={styles.dateTimeContainer}>
                                    <Button
                                        mode="outlined"
                                        onPress={() => setShowDatePicker(true)}
                                        icon={() => <Calendar size={16} color={BRAND.primary} />}
                                        style={styles.dateBtn}
                                        textColor={NEUTRAL[900]}
                                    >
                                        {dueDate ? dueDate.toDateString() : "Set Due Date"}
                                    </Button>
                                    {showDatePicker && (
                                        <CustomDateTimePicker
                                            value={dueDate || new Date()}
                                            mode="date"
                                            display="default"
                                            onChange={(event, date) => {
                                                setShowDatePicker(false);
                                                if (date) setDueDate(date);
                                            }}
                                            onClose={() => setShowDatePicker(false)}
                                        />
                                    )}

                                    <Button
                                        mode="outlined"
                                        onPress={() => setShowReminderPicker(true)}
                                        icon={() => <Clock size={16} color={BRAND.primary} />}
                                        style={styles.dateBtn}
                                        textColor={NEUTRAL[900]}
                                    >
                                        {reminder ? reminder.toLocaleString() : "Set Reminder"}
                                    </Button>
                                    {showReminderPicker && (
                                        <CustomDateTimePicker
                                            value={reminder || new Date()}
                                            mode="datetime"
                                            display="default"
                                            onChange={(event, date) => {
                                                setShowReminderPicker(false);
                                                if (date) setReminder(date);
                                            }}
                                            onClose={() => setShowReminderPicker(false)}
                                        />
                                    )}
                                </View>

                                <View style={styles.row}>
                                    <Button mode="text" onPress={() => setShowFromTimePicker(true)} compact textColor={NEUTRAL[900]}>From: {fromTime ? fromTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Any'}</Button>
                                    <Button mode="text" onPress={() => setShowToTimePicker(true)} compact textColor={NEUTRAL[900]}>To: {toTime ? toTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Any'}</Button>
                                </View>
                                {showFromTimePicker && <CustomDateTimePicker value={fromTime || dateTimeCeilTo15Minutes(new Date())} mode="time" onChange={(e, d) => { if (d) setFromTime(d); }} onClose={() => setShowFromTimePicker(false)} />}
                                {showToTimePicker && <CustomDateTimePicker value={toTime || dateTimeCeilTo15Minutes(new Date())} mode="time" onChange={(e, d) => { if (d) setToTime(d); }} onClose={() => setShowToTimePicker(false)} />}

                                <TextInput
                                    label="Notes"
                                    value={notes}
                                    onChangeText={setNotes}
                                    mode="outlined"
                                    multiline
                                    numberOfLines={3}
                                    style={styles.input}
                                    textColor="#000"
                                    outlineColor="#E0E0F0"
                                    activeOutlineColor={BRAND.primary}
                                />

                                <View style={styles.goalSection}>
                                    <Text style={styles.label}>Select Goal</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {allGoals.map((g, i) => (
                                            <Chip
                                                key={i}
                                                selected={goal?.id === g.id}
                                                onPress={() => setGoal(goal?.id === g.id ? null : g)}
                                                style={styles.chip}
                                                textStyle={{ color: NEUTRAL[900] }}
                                            >
                                                {g.title} ({g.type})
                                            </Chip>
                                        ))}
                                    </ScrollView>
                                    {/* Tag input with autocomplete */}
                                    <View style={styles.goalSection}>
                                        <Text style={styles.label}>Add Tags</Text>
                                        <TextInput
                                            label="Tag"
                                            value={tagInput}
                                            onChangeText={setTagInput}
                                            mode="outlined"
                                            style={styles.input}
                                            placeholder="Type tag and press Enter"
                                            onSubmitEditing={() => {
                                                if (tagInput.trim()) {
                                                    const existing = allTags.find(t => t.name.toLowerCase() === tagInput.trim().toLowerCase());
                                                    const tagName = existing ? existing.name : tagInput.trim();
                                                    if (!tags.includes(tagName)) setTags(prev => [...prev, tagName]);
                                                    setTagInput('');
                                                }
                                            }}
                                        />
                                        {tagInput ? (
                                            <ScrollView style={styles.suggestionsContainer} horizontal showsHorizontalScrollIndicator={false}>
                                                {allTags
                                                    .filter(t => t.name.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t.name))
                                                    .map(t => (
                                                        <Chip key={t.id} onPress={() => { setTags(prev => [...prev, t.name]); setTagInput(''); }} style={styles.chip} textStyle={{ color: NEUTRAL[900] }}>{t.name}</Chip>
                                                    ))}
                                            </ScrollView>
                                        ) : null}
                                        <View style={styles.chipContainer}>
                                            {tags.map(tagName => (
                                                <Chip key={tagName} onClose={() => setTags(prev => prev.filter(n => n !== tagName))} style={styles.chip} textStyle={{ color: NEUTRAL[900] }}>{tagName}</Chip>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={styles.footer}>
                                <Button mode="outlined" onPress={onDismiss} style={styles.footerBtn}>Cancel</Button>
                                <Button
                                    mode="contained"
                                    onPress={handleUpdate}
                                    loading={loading}
                                    disabled={loading || !title.trim()}
                                    style={[styles.footerBtn, { backgroundColor: BRAND.primary }]}
                                >
                                    Update
                                </Button>
                            </View>
                        </>
                    )}
                </Animated.View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContainer: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        backgroundColor: 'white',
        borderRadius: RADIUS.xl,
        width: Platform.OS === 'web' ? 500 : '100%',
        maxHeight: '90%',
        overflow: 'hidden',
        ...Platform.select({
            web: SHADOWS.web.modal as any,
            default: SHADOWS.native.modal,
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F8',
        backgroundColor: SURFACE.sidebar,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: NEUTRAL[900],
        letterSpacing: -0.3,
    },
    form: {
        padding: 16,
    },
    input: {
        marginBottom: 16,
        backgroundColor: SURFACE.inputBg,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 20,
        marginBottom: 16,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateTimeContainer: {
        gap: 12,
        marginBottom: 16,
    },
    dateBtn: {
        borderColor: '#E0E0F0',
        borderRadius: RADIUS.md,
    },
    goalSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: NEUTRAL[900],
        marginBottom: 8,
    },
    chip: {
        marginRight: 8,
        backgroundColor: '#F0F0F8',
        borderRadius: RADIUS.pill,
    },
    suggestionsContainer: { marginVertical: 8 },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F8',
    },
    footerBtn: {
        minWidth: 100,
        borderRadius: RADIUS.md,
    },
});
