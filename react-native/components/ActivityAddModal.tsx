import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, IconButton, Modal, Portal, Text, TextInput } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { BRAND, NEUTRAL, RADIUS, SHADOWS, SURFACE } from '@/constants/theme';
import Activity from '../src/repo/Activity';
import Task from '../src/repo/Task';

export const ACTIVITY_COLOR = '#F59E0B';

interface ActivityAddModalProps {
    visible: boolean;
    onDismiss: () => void;
    onActivityAdded: () => void;
    initialDate?: Date | null;
    initialFromTime?: Date | null;
    initialToTime?: Date | null;
}

function formatTime(d: Date) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(d: Date) {
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function ActivityAddModal({
    visible,
    onDismiss,
    onActivityAdded,
    initialDate,
    initialFromTime,
    initialToTime,
}: ActivityAddModalProps) {
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [allTags, setAllTags] = useState<any[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);

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
            setTitle('');
            setNotes('');
            setTags([]);
            setTagInput('');
            fetchTags();
        } else {
            scale.value = 0.92;
            opacity.value = 0;
        }
    }, [visible]);

    const fetchTags = async () => {
        try {
            const res = await Task.listTags();
            const tagsData = res?.data?.data ?? res?.data;
            setAllTags(tagsData ?? []);
        } catch (err) {
            console.error('Failed to fetch tags', err);
        }
    };

    const handleCreate = async () => {
        if (!title.trim() || !initialDate) return;
        setLoading(true);
        try {
            await Activity.create(
                title.trim(),
                initialDate.toISOString().split('T')[0],
                initialFromTime?.toTimeString().split(' ')[0] ?? null,
                initialToTime?.toTimeString().split(' ')[0] ?? null,
                notes.trim() || null,
                tags.length > 0 ? tags : null
            );
            onActivityAdded();
            onDismiss();
        } catch (err) {
            console.error('Failed to create activity', err);
        } finally {
            setLoading(false);
        }
    };

    const slotLabel = initialDate
        ? `${formatDate(initialDate)}${initialFromTime && initialToTime ? `  ·  ${formatTime(initialFromTime)} – ${formatTime(initialToTime)}` : ''}`
        : '';

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
                <Animated.View style={[styles.content, animStyle]}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.activityDot} />
                            <Text style={styles.headerTitle}>Log Activity</Text>
                        </View>
                        <IconButton icon="close" onPress={onDismiss} />
                    </View>

                    {slotLabel ? (
                        <View style={styles.slotBanner}>
                            <Text style={styles.slotText}>{slotLabel}</Text>
                        </View>
                    ) : null}

                    <ScrollView style={styles.form}>
                        <TextInput
                            label="What did you do?"
                            value={title}
                            onChangeText={setTitle}
                            mode="outlined"
                            style={styles.input}
                            textColor="#000"
                            outlineColor="#E0E0F0"
                            activeOutlineColor={ACTIVITY_COLOR}
                            autoFocus
                        />
                        <TextInput
                            label="Notes (optional)"
                            value={notes}
                            onChangeText={setNotes}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                            textColor="#000"
                            outlineColor="#E0E0F0"
                            activeOutlineColor={ACTIVITY_COLOR}
                        />
                        <View style={styles.tagSection}>
                            <Text style={styles.label}>Tags</Text>
                            <TextInput
                                label="Add tag"
                                value={tagInput}
                                onChangeText={setTagInput}
                                mode="outlined"
                                style={styles.input}
                                textColor="#000"
                                outlineColor="#E0E0F0"
                                activeOutlineColor={ACTIVITY_COLOR}
                                onSubmitEditing={() => {
                                    if (tagInput.trim()) {
                                        const existing = allTags.find((t) => t.name.toLowerCase() === tagInput.trim().toLowerCase());
                                        const tagName = existing ? existing.name : tagInput.trim();
                                        if (!tags.includes(tagName)) setTags((prev) => [...prev, tagName]);
                                        setTagInput('');
                                    }
                                }}
                            />
                            {tagInput ? (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsContainer}>
                                    {allTags
                                        .filter((t) => t.name.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t.name))
                                        .map((t) => (
                                            <Chip
                                                key={t.id}
                                                onPress={() => { setTags((prev) => [...prev, t.name]); setTagInput(''); }}
                                                style={styles.chip}
                                                textStyle={{ color: NEUTRAL[900] }}
                                            >
                                                {t.name}
                                            </Chip>
                                        ))}
                                </ScrollView>
                            ) : null}
                            <View style={styles.chipContainer}>
                                {tags.map((tagName) => (
                                    <Chip
                                        key={tagName}
                                        onClose={() => setTags((prev) => prev.filter((n) => n !== tagName))}
                                        style={styles.chip}
                                        textStyle={{ color: NEUTRAL[900] }}
                                    >
                                        {tagName}
                                    </Chip>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <Button mode="outlined" onPress={onDismiss} style={styles.footerBtn}>
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleCreate}
                            loading={loading}
                            disabled={loading || !title.trim()}
                            style={[styles.footerBtn, { backgroundColor: ACTIVITY_COLOR }]}
                        >
                            Log
                        </Button>
                    </View>
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
    content: {
        backgroundColor: 'white',
        borderRadius: RADIUS.xl,
        width: Platform.OS === 'web' ? 440 : '100%',
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
        paddingLeft: 20,
        paddingRight: 4,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F8',
        backgroundColor: SURFACE.sidebar,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    activityDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: ACTIVITY_COLOR,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: NEUTRAL[900],
        letterSpacing: -0.3,
    },
    slotBanner: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#FFFBEB',
        borderBottomWidth: 1,
        borderBottomColor: '#FDE68A',
    },
    slotText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#92400E',
        letterSpacing: 0.1,
    },
    form: {
        padding: 16,
    },
    tagSection: {
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
        backgroundColor: '#FFF3CD',
        borderRadius: RADIUS.pill,
    },
    suggestionsContainer: {
        marginVertical: 8,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    input: {
        marginBottom: 16,
        backgroundColor: SURFACE.inputBg,
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
