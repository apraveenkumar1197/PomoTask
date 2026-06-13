import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Modal, Portal, Text, TextInput } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { BRAND, NEUTRAL, RADIUS, SHADOWS, SURFACE } from '@/constants/theme';
import Goal from '../src/repo/Goal';

interface CreateMonthlyGoalModalProps {
    visible: boolean;
    onDismiss: () => void;
    onGoalSaved: () => void;
    year: number;
    month: string;
    editGoalId?: string | null;
}

export default function CreateMonthlyGoalModal({ visible, onDismiss, onGoalSaved, year, month, editGoalId }: CreateMonthlyGoalModalProps) {
    const [title, setTitle] = useState('');
    const [linkedYearlyGoals, setLinkedYearlyGoals] = useState<any[]>([]);
    const [yearlyGoals, setYearlyGoals] = useState<any[]>([]);
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
        if (visible) {
            fetchYearlyGoals();
            if (editGoalId) {
                fetchGoalData();
            } else {
                resetForm();
            }
        }
    }, [visible, editGoalId]);

    const fetchYearlyGoals = async () => {
        try {
            const res = await Goal.listByYear(year, true);
            setYearlyGoals(res.data.data.goals);
        } catch (err) {
            console.error('Failed to fetch yearly goals', err);
        }
    };

    const fetchGoalData = async () => {
        setFetching(true);
        try {
            const res = await Goal.editGoal(editGoalId!);
            const goal = res.data.data.goal;
            setTitle(goal.title || '');
            setLinkedYearlyGoals(goal.linked_goals || []);
        } catch (err) {
            console.error('Failed to fetch goal data', err);
        } finally {
            setFetching(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setLinkedYearlyGoals([]);
    };

    const toggleLinkedGoal = (goal: any) => {
        setLinkedYearlyGoals((prev) => {
            const exists = prev.find((g) => g.id === goal.id);
            if (exists) {
                return prev.filter((g) => g.id !== goal.id);
            }
            return [...prev, goal];
        });
    };

    const handleSave = async () => {
        if (!title.trim()) return;
        setLoading(true);
        try {
            const linkedIds = linkedYearlyGoals.map((g) => g.id);
            if (editGoalId) {
                await Goal.updateMonthlyGoal(editGoalId, year, month, title, linkedIds);
            } else {
                await Goal.createMonthlyGoal(year, month, title, linkedIds);
            }
            onGoalSaved();
            onDismiss();
            resetForm();
        } catch (err) {
            console.error('Failed to save monthly goal', err);
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
                            {editGoalId ? 'Edit Monthly Goal' : 'New Monthly Goal'}
                        </Text>
                        <Text style={styles.subtitle}>{month} {year}</Text>
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

                        {yearlyGoals.length > 0 && (
                            <>
                                <Text style={styles.label}>Link to Yearly Goals</Text>
                                <View style={styles.chipsContainer}>
                                    {yearlyGoals.map((g) => {
                                        const isSelected = linkedYearlyGoals.some((lg) => lg.id === g.id);
                                        return (
                                            <Chip
                                                key={g.id}
                                                selected={isSelected}
                                                onPress={() => toggleLinkedGoal(g)}
                                                style={[styles.goalChip, isSelected && styles.selectedGoalChip]}
                                                textStyle={[styles.goalChipText, isSelected && styles.selectedGoalChipText]}
                                                showSelectedCheck={false}
                                            >
                                                {g.title}
                                            </Chip>
                                        );
                                    })}
                                </View>
                            </>
                        )}
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
    subtitle: {
        fontSize: 13,
        color: NEUTRAL[500],
        marginTop: 2,
        fontWeight: '500',
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
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    goalChip: {
        backgroundColor: '#F0F0F8',
        borderRadius: RADIUS.pill,
    },
    selectedGoalChip: {
        backgroundColor: BRAND.primary,
        borderRadius: RADIUS.pill,
    },
    goalChipText: {
        color: NEUTRAL[500],
    },
    selectedGoalChipText: {
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
