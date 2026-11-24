import PointItemEditor from '@/components/PointItemEditor';
import { BRAND, NEUTRAL, RADIUS, SHADOWS, SURFACE } from '@/constants/theme';
import Points, { PointItem, pointsError, repeatLabel } from '@/src/repo/Points';
import dayjs from 'dayjs';
import { useFocusEffect } from 'expo-router';
import { CalendarClock, ChevronLeft, ChevronRight, ListChecks, Pencil, Plus, SlidersHorizontal } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Button, Checkbox, IconButton, Snackbar, Text } from 'react-native-paper';

const SECTIONS = [
    { key: 'all', label: 'All items', Icon: ListChecks },
    { key: 'manage', label: 'Manage items', Icon: SlidersHorizontal },
] as const;

export default function PointsScreen() {
    const { width } = useWindowDimensions();
    const wide = Platform.OS === 'web' && width > 768;
    const [section, setSection] = useState<'all' | 'manage'>('all');
    const [items, setItems] = useState<PointItem[]>([]);
    const [today, setToday] = useState(dayjs().format('YYYY-MM-DD'));
    const [selected, setSelected] = useState<string>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [reload, setReload] = useState(0);
    const [updating, setUpdating] = useState<string[]>([]);
    const [editor, setEditor] = useState<{ item: PointItem | null } | null>(null);
    const date = selected ?? today;
    const visibleItems = section === 'all' ? items.filter(item => item.period_start !== null) : items;

    useFocusEffect(useCallback(() => {
        let active = true;
        setLoading(true);
        setError('');
        Points.list(selected).then(data => {
            if (!active) return;
            setToday(data.today);
            setItems(data.items);
        }).catch(err => {
            if (active) setError(pointsError(err, 'Could not load Points.'));
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, [selected, reload]));

    const changeDay = (delta: number) => {
        const next = dayjs(date).add(delta, 'day').format('YYYY-MM-DD');
        if (next <= today) setSelected(next === today ? undefined : next);
    };

    const toggle = async (item: PointItem) => {
        setUpdating(previous => [...previous, item.id]);
        try {
            await Points.checkIn(item.id, date, !item.achieved);
            setItems(previous => previous.map(row => row.id === item.id ? { ...row, achieved: !item.achieved } : row));
        } catch (err) {
            setNotice(pointsError(err, 'Could not update the checkmark.'));
        } finally {
            setUpdating(previous => previous.filter(id => id !== item.id));
        }
    };

    const navigation = (
        <View style={wide ? styles.sidebar : styles.sectionRow} accessibilityLabel="Points navigation">
            {SECTIONS.map(({ key, label, Icon }) => (
                <Pressable key={key} onPress={() => setSection(key)} accessibilityRole="button"
                    accessibilityState={{ selected: section === key }}
                    style={[styles.navItem, section === key && styles.active]}>
                    <Icon size={17} color={section === key ? BRAND.primary : NEUTRAL[500]} />
                    <Text style={[styles.navText, section === key && styles.activeText]}>{label}</Text>
                </Pressable>
            ))}
        </View>
    );

    return (
        <View style={[styles.page, wide && styles.wide]}>
            {navigation}
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text variant="headlineSmall" style={styles.heading}>{section === 'all' ? 'All items' : 'Manage items'}</Text>
                    <Button mode="contained" icon={() => <Plus size={16} color="#fff" />}
                        onPress={() => setEditor({ item: null })} disabled={loading}>Add item</Button>
                </View>
                {section === 'all' && (
                    <View style={styles.dateRow}>
                        <IconButton icon={() => <ChevronLeft size={19} color={NEUTRAL[700]} />}
                            accessibilityLabel="Previous day" onPress={() => changeDay(-1)} disabled={updating.length > 0} />
                        <IconButton icon={() => <ChevronRight size={19} color={NEUTRAL[700]} />}
                            accessibilityLabel="Next day" onPress={() => changeDay(1)} disabled={date >= today || updating.length > 0} />
                        <Text style={styles.dateText}>{dayjs(date).format('dddd, D MMMM')}</Text>
                        {date !== today && <Button compact onPress={() => setSelected(undefined)} disabled={updating.length > 0}>Today</Button>}
                    </View>
                )}
                {loading ? <ActivityIndicator style={styles.empty} color={BRAND.primary} /> : error ? (
                    <View style={styles.empty}>
                        <Text>{error}</Text><Button onPress={() => setReload(value => value + 1)}>Retry</Button>
                    </View>
                ) : visibleItems.length === 0 ? (
                    <View style={[styles.card, styles.empty]}>
                        <Text variant="titleMedium">{items.length ? 'No items due on this date' : 'No items yet'}</Text>
                        {!items.length && (
                            <Text style={styles.meta}>Add an item and choose how often you want to achieve it.</Text>
                        )}
                    </View>
                ) : visibleItems.map(item => {
                    const rule = section === 'manage' ? item.settings : item.rule;
                    const from = (section === 'manage' ? rule.from_time : item.from_time)?.slice(0, 5);
                    const to = (section === 'manage' ? rule.to_time : item.to_time)?.slice(0, 5);
                    const period = item.period_start && item.period_end && item.period_start !== item.period_end
                        ? `${dayjs(item.period_start).format('D MMM')}–${dayjs(item.period_end).format('D MMM')}`
                        : null;
                    return (
                        <View key={item.id} style={styles.card}>
                            {section === 'all' && <Checkbox.Android
                                status={item.achieved ? 'checked' : 'unchecked'} color={BRAND.primary}
                                accessibilityLabel={`Mark ${rule.title} achieved`}
                                disabled={updating.includes(item.id)}
                                onPress={() => toggle(item)} />}
                            <View style={styles.itemText}>
                                <Text style={[styles.itemTitle, section === 'all' && item.achieved && styles.achieved]}>{rule.title}</Text>
                                <View style={styles.detailRow}>
                                    <Text style={styles.chip}>{repeatLabel(rule)}</Text>
                                    {section === 'all' && period && <Text style={styles.meta}>{period}</Text>}
                                    {section === 'manage' && item.settings.effective > today &&
                                        <Text style={styles.meta}>Changes start {dayjs(item.settings.effective).format('D MMM')}</Text>}
                                </View>
                                {rule.show_task && (
                                    <View style={styles.detailRow}>
                                        <CalendarClock size={13} color={BRAND.primary} />
                                        <Text style={styles.meta}>Task · {from}–{to}
                                            {section === 'all' && (item.planned_date
                                                ? ` · ${dayjs(item.planned_date).format('D MMM')}`
                                                : ' · Date to be planned')}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            {section === 'manage' && (
                                <IconButton icon={() => <Pencil size={17} color={BRAND.primary} />}
                                    accessibilityLabel={`Edit ${rule.title}`} onPress={() => setEditor({ item })} />
                            )}
                        </View>
                    );
                })}
            </ScrollView>
            {editor && <PointItemEditor item={editor.item} today={today} onDismiss={() => setEditor(null)}
                onSaved={effective => {
                    setEditor(null);
                    setReload(value => value + 1);
                    setNotice(effective && effective > today
                        ? `Changes start ${dayjs(effective).format('D MMM')}.` : 'Item saved.');
                }} />}
            <Snackbar visible={!!notice} onDismiss={() => setNotice('')}>{notice}</Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: SURFACE.page },
    wide: { flexDirection: 'row' },
    sidebar: { width: 174, padding: 12, gap: 4, backgroundColor: SURFACE.sidebar, borderRightWidth: 1, borderColor: NEUTRAL[200] },
    sectionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 10 },
    navItem: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 10, borderRadius: RADIUS.md },
    navText: { color: NEUTRAL[700] },
    active: { backgroundColor: BRAND.primaryLight },
    activeText: { color: BRAND.primary, fontWeight: '700' },
    scroll: { flex: 1 },
    content: { padding: 16, gap: 10, width: '100%', maxWidth: 1000, alignSelf: 'center', paddingBottom: 32 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
    heading: { color: NEUTRAL[900], fontWeight: '700' },
    dateRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 2 },
    dateText: { color: NEUTRAL[700], fontWeight: '600', marginLeft: 4 },
    card: {
        flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.xl, backgroundColor: SURFACE.card,
        paddingVertical: 8, paddingHorizontal: 10, borderLeftWidth: 3, borderLeftColor: BRAND.primary, gap: 6,
        ...(Platform.OS === 'web' ? SHADOWS.web.card : SHADOWS.native.sm),
    },
    itemText: { flex: 1, gap: 4, paddingVertical: 4 },
    itemTitle: { fontSize: 15, fontWeight: '600', color: NEUTRAL[900] },
    achieved: { color: NEUTRAL[500] },
    detailRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 5 },
    chip: { backgroundColor: BRAND.primaryLight, color: BRAND.primaryDark, paddingHorizontal: 7, paddingVertical: 2, fontSize: 11, borderRadius: RADIUS.pill },
    meta: { color: NEUTRAL[500], fontSize: 12 },
    empty: { padding: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 },
});
