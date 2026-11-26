import { BRAND, NEUTRAL, RADIUS, SHADOWS, SURFACE } from '@/constants/theme';
import Points, { PointMonth } from '@/src/repo/Points';
import dayjs from 'dayjs';
import { useFocusEffect } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, IconButton, Text } from 'react-native-paper';

const percent = (achieved: number, due: number) => due ? Math.round(1000 * achieved / due) / 10 : 0;

export default function PointsMonthlySummary() {
    const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));
    const [selected, setSelected] = useState<string>();
    const [data, setData] = useState<PointMonth>();
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [retry, setRetry] = useState(0);
    const month = selected ?? currentMonth;

    useFocusEffect(useCallback(() => {
        let active = true;
        setLoading(true);
        setFailed(false);
        Points.summary(selected).then(result => {
            if (!active) return;
            if (!selected) setCurrentMonth(result.through.slice(0, 7));
            setData(result);
        }).catch(() => {
            if (active) setFailed(true);
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, [selected, retry]));

    const changeMonth = (delta: number) => {
        const next = dayjs(`${month}-01`).add(delta, 'month').format('YYYY-MM');
        if (next <= currentMonth) setSelected(next === currentMonth ? undefined : next);
    };

    return (
        <Card style={styles.card} elevation={0}>
            <Card.Content>
                <View style={styles.header}>
                    <Text variant="titleMedium" style={styles.title}>Points · monthly achievement</Text>
                    <View style={styles.monthPicker}>
                        <IconButton icon={() => <ChevronLeft size={17} color={BRAND.primary} />}
                            onPress={() => changeMonth(-1)} accessibilityLabel="Previous month" />
                        <Text style={styles.month}>{dayjs(`${month}-01`).format('MMMM YYYY')}</Text>
                        <IconButton icon={() => <ChevronRight size={17} color={BRAND.primary} />}
                            onPress={() => changeMonth(1)} disabled={month >= currentMonth} accessibilityLabel="Next month" />
                    </View>
                </View>
                {loading ? <ActivityIndicator color={BRAND.primary} style={styles.state} /> : failed ? (
                    <View style={styles.state}>
                        <Text>Could not load monthly achievement.</Text><Button onPress={() => setRetry(value => value + 1)}>Retry</Button>
                    </View>
                ) : data && data.due ? (
                    <>
                        <View style={styles.overall}>
                            <Text style={styles.percentage}>{percent(data.achieved, data.due)}%</Text>
                            <Text style={styles.caption}>{data.achieved} of {data.due} due occurrences achieved</Text>
                        </View>
                        <View
                            style={styles.bar}
                            accessibilityRole="progressbar"
                            accessibilityLabel="Monthly Points achievement"
                            accessibilityValue={{ min: 0, max: 100, now: percent(data.achieved, data.due) }}
                        >
                            <View style={[styles.barFill, { width: `${100 * data.achieved / data.due}%` }]} />
                        </View>
                        <View style={styles.items}>
                            {data.items.map(item => (
                                <View style={styles.item} key={item.id}>
                                    <Text style={styles.itemTitle}>{item.title}</Text>
                                    <Text style={styles.itemAchievement}>
                                        {item.achieved} / {item.due} · {percent(item.achieved, item.due)}%
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </>
                ) : <Text style={[styles.caption, styles.state]}>No items due this month.</Text>}
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: { marginBottom: 20, borderRadius: RADIUS.xl, backgroundColor: SURFACE.card,
        ...(Platform.OS === 'web' ? SHADOWS.web.md : SHADOWS.native.sm) },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' },
    title: { color: NEUTRAL[900], fontWeight: '700' },
    monthPicker: { flexDirection: 'row', alignItems: 'center' },
    month: { color: NEUTRAL[700], fontWeight: '600' },
    overall: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'baseline', marginBottom: 8 },
    percentage: { color: BRAND.primary, fontSize: 30, fontWeight: '700' },
    caption: { color: NEUTRAL[500], fontSize: 13 },
    bar: { height: 8, flexShrink: 0, overflow: 'hidden', borderRadius: RADIUS.pill, backgroundColor: BRAND.primaryLight, marginBottom: 7 },
    barFill: { height: '100%', backgroundColor: BRAND.primary, borderRadius: RADIUS.pill },
    items: { marginTop: 12 },
    item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: NEUTRAL[200] },
    itemTitle: { flex: 1, minWidth: 0, color: NEUTRAL[900], fontWeight: '600' },
    itemAchievement: { color: NEUTRAL[700], fontSize: 12, textAlign: 'right' },
    state: { paddingVertical: 16, alignItems: 'center' },
});
