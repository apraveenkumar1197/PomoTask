import { Pencil, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Checkbox, Chip, IconButton, Surface, Text } from 'react-native-paper';
import { BRAND, NEUTRAL, RADIUS, SHADOWS } from '@/constants/theme';
import Goal from '../src/repo/Goal';

interface YearlyGoalListProps {
    year: number;
    listReload: boolean;
    onEdit?: (goal: any) => void;
    onDelete?: (goal: any) => void;
    highlightMonth?: string;
}

export default function YearlyGoalList({ year, listReload, onEdit, onDelete, highlightMonth }: YearlyGoalListProps) {
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const res = await Goal.listByYear(year);
            setGoals(res.data.data.goals);
        } catch (err) {
            console.error('Failed to fetch yearly goals', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, [year, listReload]);

    const toggleStatus = async (goal: any) => {
        const newStatus = goal.status_bool ? '0' : '1';
        try {
            await Goal.updateYearlyGoalStatus(goal.id, newStatus);
            fetchGoals();
        } catch (err) {
            console.error('Failed to update goal status', err);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isHighlighted = highlightMonth && item.months?.includes(highlightMonth);
        return (
            <Surface
                style={[styles.card, isHighlighted && styles.highlightedCard, item.status_bool && styles.completedCard]}
                elevation={0}
            >
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
                        <View style={styles.chipRow}>
                            {item.months?.map((month: string, idx: number) => (
                                <Chip
                                    key={idx}
                                    style={[styles.monthChip, highlightMonth === month && styles.activeMonthChip]}
                                    textStyle={[styles.chipText, highlightMonth === month && styles.activeChipText]}
                                    compact
                                >
                                    {month}
                                </Chip>
                            ))}
                        </View>
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
    };

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
                    <Text style={{ color: NEUTRAL[500] }}>No yearly goals</Text>
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
    highlightedCard: {
        borderWidth: 1.5,
        borderColor: BRAND.primary,
        backgroundColor: BRAND.primaryLight,
        ...Platform.select({
            web: SHADOWS.web.card as any,
            default: SHADOWS.native.card,
        }),
    },
    completedCard: {
        opacity: 0.55,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
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
        marginBottom: 6,
    },
    completedTitle: {
        textDecorationLine: 'line-through',
        color: NEUTRAL[500],
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    monthChip: {
        backgroundColor: '#F0F0F8',
        height: 26,
        borderRadius: RADIUS.pill,
    },
    activeMonthChip: {
        backgroundColor: BRAND.primary,
    },
    chipText: {
        fontSize: 11,
        color: NEUTRAL[500],
    },
    activeChipText: {
        color: '#fff',
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
