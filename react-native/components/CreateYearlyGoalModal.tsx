import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Modal, Portal, Text, TextInput } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { BRAND, NEUTRAL, RADIUS, SHADOWS, SURFACE } from '@/constants/theme';
import DateUtil from '../src/functionalities/DateUtil';
import Goal from '../src/repo/Goal';

interface CreateYearlyGoalModalProps {
    visible: boolean;
    onDismiss: () => void;
    onGoalSaved: () => void;
    year: number;
    editGoalId?: string | null;
}

export default function CreateYearlyGoalModal({ visible, onDismiss, onGoalSaved, year, editGoalId }: CreateYearlyGoalModalProps) {
    const [title, setTitle] = useState('');
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

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
        if (visible && editGoalId) {
            fetchGoalData();
        } else if (visible && !editGoalId) {
            resetForm();
        }
    }, [visible, editGoalId]);

    const fetchGoalData = async () => {
        setFetching(true);
        try {
            const res = await Goal.editGoal(editGoalId!);
            const goal = res.data.data.goal;
            setTitle(goal.title || '');
            setSelectedMonths(goal.months || []);
        } catch (err) {
            console.error('Failed to fetch goal data', err);
        } finally {
            setFetching(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setSelectedMonths([]);
    };

    const toggleMonth = (month: string) => {
        setSelectedMonths((prev) => {
            if (prev.includes(month)) {
                return prev.filter((m) => m !== month);
            }
            const newList = [...prev, month];
            return newList.sort((a, b) => DateUtil.MONTH_LIST.indexOf(a) - DateUtil.MONTH_LIST.indexOf(b));
        });
    };

    const handleSave = async () => {
        if (!title.trim()) return;
        setLoading(true);
        try {
            if (editGoalId) {
                await Goal.updateYearlyGoal(editGoalId, title, year, selectedMonths);
            } else {
                await Goal.createYearlyGoal(title, year, selectedMonths);
            }
            onGoalSaved();
            onDismiss();
            resetForm();
        } catch (err) {
            console.error('Failed to save yearly goal', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
                <Animated.View style={[styles.surface, animStyle]}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            {editGoalId ? 'Edit Yearly Goal' : 'New Yearly Goal'}
                        </Text>
                    </View>

                    <ScrollView style={styles.form}>
                        <TextInput
                            label="Goal Title"
                            value={title}
                            onChangeText={setTitle}
                            mode="outlined"
                            style={styles.input}
                            textColor="#000"
                            outlineColor="#E0E0F0"
                            activeOutlineColor={BRAND.primary}
                        />

                        <Text style={styles.label}>Select Months</Text>
                        <View style={styles.monthsGrid}>
                            {DateUtil.MONTH_LIST.map((month: string) => (
                                <Chip
                                    key={month}
                                    selected={selectedMonths.includes(month)}
                                    onPress={() => toggleMonth(month)}
                                    style={[
                                        styles.monthChip,
                                        selectedMonths.includes(month) && styles.selectedMonthChip,
                                    ]}
                                    textStyle={[
                                        styles.monthChipText,
                                        selectedMonths.includes(month) && styles.selectedMonthChipText,
                                    ]}
                                    showSelectedCheck={false}
                                >
                                    {month}
                                </Chip>
                            ))}
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <Button mode="outlined" onPress={onDismiss} style={styles.footerBtn}>Cancel</Button>
                        <Button
                            mode="contained"
                            onPress={handleSave}
                            loading={loading}
                            disabled={loading || !title.trim()}
                            style={[styles.footerBtn, { backgroundColor: BRAND.primary }]}
                        >
                            {editGoalId ? 'Update' : 'Create'}
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
    surface: {
        backgroundColor: 'white',
        borderRadius: RADIUS.xl,
        width: Platform.OS === 'web' ? 460 : '100%',
        maxHeight: '90%',
        overflow: 'hidden',
        ...Platform.select({
            web: SHADOWS.web.modal as any,
            default: SHADOWS.native.modal,
        }),
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F8',
        backgroundColor: SURFACE.sidebar,
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
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: NEUTRAL[900],
        marginBottom: 8,
    },
    monthsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    monthChip: {
        backgroundColor: '#F0F0F8',
        borderRadius: RADIUS.pill,
    },
    selectedMonthChip: {
        backgroundColor: BRAND.primary,
        borderRadius: RADIUS.pill,
    },
    monthChipText: {
        color: NEUTRAL[500],
    },
    selectedMonthChipText: {
        color: '#fff',
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
