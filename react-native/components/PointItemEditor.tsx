import { BRAND, NEUTRAL, RADIUS, SURFACE } from '@/constants/theme';
import Points, { PointItem, PointSettings, Repeat, WEEKDAYS, pointsError } from '@/src/repo/Points';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Checkbox, Chip, HelperText, Modal, Portal, Text, TextInput } from 'react-native-paper';

const REPEAT_OPTIONS: { value: Repeat; label: string }[] = [
    { value: 'daily', label: 'Every day' },
    { value: 'weekdays', label: 'Selected weekdays' },
    { value: 'interval', label: 'Every N days' },
    { value: 'weekly', label: 'Every week' },
    { value: 'monthly', label: 'Every month' },
];

interface Props {
    item: PointItem | null;
    today: string;
    onDismiss: () => void;
    onSaved: (effective?: string) => void;
}

export default function PointItemEditor({ item, today, onDismiss, onSaved }: Props) {
    const { height } = useWindowDimensions();
    const settings = item?.settings;
    const [title, setTitle] = useState(settings?.title ?? '');
    const [start, setStart] = useState(settings?.start_date ?? today);
    const [repeat, setRepeat] = useState<Repeat>(settings?.repeat ?? 'daily');
    const [weekdays, setWeekdays] = useState(settings?.weekdays ?? []);
    const [weekday, setWeekday] = useState<number | null>(settings?.weekday ?? null);
    const [monthDay, setMonthDay] = useState(settings?.month_day?.toString() ?? '');
    const [interval, setInterval] = useState(settings?.interval?.toString() ?? '3');
    const [showTask, setShowTask] = useState(settings?.show_task ?? false);
    const [from, setFrom] = useState(settings?.from_time?.slice(0, 5) ?? '');
    const [to, setTo] = useState(settings?.to_time?.slice(0, 5) ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const needsTaskDate = (repeat === 'weekly' && weekday === null) ||
        (repeat === 'monthly' && !monthDay.trim());

    const save = async () => {
        const data: PointSettings = {
            title: title.trim(), start_date: start.trim(), repeat, weekdays,
            weekday, month_day: monthDay.trim() ? Number(monthDay) : null,
            interval: interval.trim() ? Number(interval) : null, show_task: showTask,
            from_time: showTask ? from.trim() : null,
            to_time: showTask ? to.trim() : null,
        };
        if (!data.title) {
            setError('Enter an item name.');
            return;
        }
        const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;
        if (showTask && (!validTime.test(from.trim()) || !validTime.test(to.trim()) || from.trim() >= to.trim())) {
            setError('Enter start and end in HH:mm format, with the end after the start.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const result = await Points.save(data, item?.id);
            onSaved(result.effective);
        } catch (err) {
            setError(pointsError(err, 'Could not save this item. Try again.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Portal>
            <Modal visible onDismiss={onDismiss} dismissable={!saving} dismissableBackButton={!saving}
                contentContainerStyle={styles.modal}>
                <ScrollView style={{ maxHeight: Math.max(240, height * 0.83) }} keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.form}>
                    <Text variant="titleLarge" style={styles.title}>{item ? 'Edit Point item' : 'Add Point item'}</Text>
                    <TextInput mode="outlined" label="Item name" value={title} onChangeText={setTitle}
                        maxLength={120} editable={!saving} />
                    {!item && <TextInput mode="outlined" label="Start date (YYYY-MM-DD)" value={start}
                        onChangeText={setStart} autoCapitalize="none" editable={!saving} />}
                    <Text variant="labelLarge" style={styles.label}>Repeat for</Text>
                    <View style={styles.choices}>
                        {REPEAT_OPTIONS.map(option => (
                            <Chip key={option.value} selected={repeat === option.value}
                                onPress={() => setRepeat(option.value)} disabled={saving}>
                                {option.label}
                            </Chip>
                        ))}
                    </View>
                    {repeat === 'interval' && <TextInput mode="outlined" label="Days between occurrences"
                        value={interval} onChangeText={setInterval} keyboardType="number-pad" editable={!saving} />}
                    {(repeat === 'weekly' || repeat === 'weekdays') && (
                        <>
                            <Text variant="labelLarge" style={styles.label}>
                                {repeat === 'weekly' ? 'Planned weekday (optional)' : 'Repeat on'}
                            </Text>
                            <View style={styles.choices}>
                                {repeat === 'weekly' && <Chip selected={weekday === null}
                                    onPress={() => setWeekday(null)} disabled={saving}>Any day</Chip>}
                                {WEEKDAYS.map((label, day) => (
                                    <Chip key={label} selected={repeat === 'weekly' ? weekday === day : weekdays.includes(day)}
                                        onPress={() => repeat === 'weekly'
                                            ? setWeekday(day)
                                            : setWeekdays(current => current.includes(day) ? current.filter(d => d !== day) : [...current, day])}
                                        disabled={saving}>{label}</Chip>
                                ))}
                            </View>
                        </>
                    )}
                    {repeat === 'monthly' && <TextInput mode="outlined" label="Planned day of month (optional)"
                        value={monthDay} onChangeText={setMonthDay} keyboardType="number-pad"
                        placeholder="1–31, or leave blank" editable={!saving} />}
                    <View style={styles.taskSection}>
                        <Checkbox.Item label="Show as task" status={showTask ? 'checked' : 'unchecked'}
                            position="leading" color={BRAND.primary} onPress={() => setShowTask(value => !value)}
                            disabled={saving} style={styles.checkbox} />
                        {showTask && (
                            <>
                                <View style={styles.timeFields}>
                                    <TextInput style={styles.time} mode="outlined" label="Planned start"
                                        placeholder="HH:mm" value={from} onChangeText={setFrom} editable={!saving} />
                                    <TextInput style={styles.time} mode="outlined" label="Planned end"
                                        placeholder="HH:mm" value={to} onChangeText={setTo} editable={!saving} />
                                </View>
                                <Text style={styles.note}>
                                    {needsTaskDate
                                        ? 'Choose a date for each occurrence in Tasks to put it on Calendar.'
                                        : 'Each occurrence appears in Tasks and Calendar at these times.'}
                                </Text>
                            </>
                        )}
                    </View>
                    {item && <Text style={styles.note}>
                        Earlier results stay in history. Changes to the repeat schedule start after the current occurrence.
                    </Text>}
                    {!!error && <HelperText type="error" visible accessibilityLiveRegion="polite">{error}</HelperText>}
                    <View style={styles.actions}>
                        <Button onPress={onDismiss} disabled={saving}>Cancel</Button>
                        <Button mode="contained" onPress={save} loading={saving} disabled={saving}>Save item</Button>
                    </View>
                </ScrollView>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modal: { backgroundColor: SURFACE.card, borderRadius: RADIUS.xl, alignSelf: 'center', width: '94%', maxWidth: 570 },
    form: { padding: 20, gap: 12 },
    title: { color: NEUTRAL[900], fontWeight: '700' },
    label: { color: NEUTRAL[700], marginTop: 4 },
    choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    taskSection: { borderTopWidth: 1, borderColor: NEUTRAL[200], gap: 8, marginTop: 4, paddingTop: 4 },
    checkbox: { paddingHorizontal: 0 },
    timeFields: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    time: { flex: 1, minWidth: 120 },
    note: { color: NEUTRAL[500], fontSize: 13 },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
