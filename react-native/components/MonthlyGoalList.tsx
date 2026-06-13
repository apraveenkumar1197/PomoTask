import { Pencil, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Checkbox, IconButton, Surface, Text } from 'react-native-paper';
import { BRAND, NEUTRAL, RADIUS, SHADOWS } from '@/constants/theme';
import Goal from '../src/repo/Goal';

interface MonthlyGoalListProps {
    year: number;
    month: string;
    listReload: boolean;
    onEdit?: (goal: any) => void;
    onDelete?: (goal: any) => void;
}

export default function MonthlyGoalList({ year, month, listReload, onEdit, onDelete }: MonthlyGoalListProps) {
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const res = await Goal.listByYearAndMonth(year, month);
            setGoals(res.data.data.goals);
        } catch (err) {
            console.error('Failed to fetch monthly goals', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, [year, month, listReload]);

    const toggleStatus = async (goal: any) => {
        const newStatus = goal.status_bool ? '0' : '1';
        try {
            await Goal.updateYearlyGoalStatus(goal.id, newStatus);
            fetchGoals();
        } catch (err) {
            console.error('Failed to update goal status', err);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <Surface style={[styles.card, item.status_bool && styles.completedCard]} elevation={0}>
            <View style={styles.row}>
                <Checkbox
                    status={item.status_bool ? 'checked' : 'unchecked'}
                    onPress={() => toggleStatus(item)}
                    color={BRAND.primary}
                />
                <View style={styles.content}>
                    <Text style={[styles.title, item.status_bool && styles.completedTitle]} numberOfLines={2}>
                        {item.title}
                    </Text>
                </View>
                <View style={styles.actions}>
                    {onEdit && (
                        <IconButton
                            icon={() => <Pencil size={16} color={NEUTRAL[500]} />}
                            onPress={() => onEdit(item)}
                            style={styles.actionBtn}
                        />
                    )}
                    {onDelete && (
                        <IconButton
                            icon={() => <Trash2 size={16} color="#EA4335" />}
                            onPress={() => onDelete(item)}
                            style={styles.actionBtn}
                        />
                    )}
                </View>
            </View>
        </Surface>
    );

    if (loading && goals.length === 0) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator color={BRAND.primary} />
            </View>
        );
    }

    return (
        <FlatList
            data={goals}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
                <View style={styles.empty}>
                    <Text style={{ color: NEUTRAL[500] }}>No monthly goals</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 10,
        borderRadius: RADIUS.md,
        backgroundColor: '#fff',
        ...Platform.select({
            web: SHADOWS.web.card as any,
            default: SHADOWS.native.sm,
        }),
    },
    completedCard: {
        opacity: 0.55,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    content: {
        flex: 1,
        paddingRight: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: NEUTRAL[900],
    },
    completedTitle: {
        textDecorationLine: 'line-through',
        color: NEUTRAL[500],
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        margin: 0,
        width: 30,
        height: 30,
    },
    loader: {
        padding: 40,
        alignItems: 'center',
    },
    empty: {
        alignItems: 'center',
        marginTop: 40,
    },
});
