import { useFocusEffect } from 'expo-router';
import {
    Calendar as CalendarIcon,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    RotateCcw,
    Save
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import {
    ActivityIndicator,
    Button,
    Chip,
    IconButton,
    Snackbar,
    Surface,
    Text,
    TextInput,
    Tooltip
} from 'react-native-paper';
import dayjs from 'dayjs';

import CustomDateTimePicker from '@/components/CustomDateTimePicker';
import { ThemedView } from '@/components/themed-view';
import { BRAND, NEUTRAL, RADIUS, SHADOWS, SURFACE } from '@/constants/theme';
import Dairy from '@/src/repo/Dairy';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web' && SCREEN_WIDTH > 768;

export default function DairyScreen() {
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [text, setText] = useState('');
    const [initialText, setInitialText] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const hasUnsavedChanges = text !== initialText;

    const wordCount = useMemo(() => {
        const trimmed = text.trim();
        if (!trimmed) return 0;
        return trimmed.split(/\s+/).length;
    }, [text]);

    const characterCount = text.length;

    const fetchDairyEntry = useCallback(async (dateStr: string) => {
        setLoading(true);
        try {
            const res = await Dairy.getByDate(dateStr);
            const data = res?.data?.data ?? res?.data;
            const entryText = data?.text ?? '';
            setText(entryText);
            setInitialText(entryText);
            if (data?.updated_at) {
                setLastSavedTime(dayjs(data.updated_at).format('hh:mm A'));
            } else {
                setLastSavedTime(null);
            }
        } catch (err) {
            console.error('Failed to fetch dairy entry:', err);
            setText('');
            setInitialText('');
            setLastSavedTime(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDairyEntry(selectedDate);
    }, [selectedDate, fetchDairyEntry]);

    useFocusEffect(
        useCallback(() => {
            fetchDairyEntry(selectedDate);
        }, [selectedDate, fetchDairyEntry])
    );

    const handlePreviousDay = () => {
        const prev = dayjs(selectedDate).subtract(1, 'day').format('YYYY-MM-DD');
        setSelectedDate(prev);
    };

    const handleNextDay = () => {
        const next = dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD');
        setSelectedDate(next);
    };

    const handleToday = () => {
        const today = dayjs().format('YYYY-MM-DD');
        setSelectedDate(today);
    };

    const handleSave = async () => {
        if (saving) return;
        setSaving(true);
        try {
            const res = await Dairy.saveDairy(selectedDate, text);
            setInitialText(text);
            const nowTime = dayjs().format('hh:mm A');
            setLastSavedTime(nowTime);
            setSnackbarMessage('Dairy entry saved successfully!');
            setSnackbarVisible(true);
        } catch (err) {
            console.error('Failed to save dairy entry:', err);
            setSnackbarMessage('Failed to save dairy entry. Please try again.');
            setSnackbarVisible(true);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setText(initialText);
    };

    const relativeDateTag = useMemo(() => {
        const today = dayjs().format('YYYY-MM-DD');
        const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
        const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

        if (selectedDate === today) return 'Today';
        if (selectedDate === yesterday) return 'Yesterday';
        if (selectedDate === tomorrow) return 'Tomorrow';
        return null;
    }, [selectedDate]);

    const formattedDateHeader = useMemo(() => {
        return dayjs(selectedDate).format('dddd, D MMMM YYYY');
    }, [selectedDate]);

    const selectedDateObj = useMemo(() => {
        return dayjs(selectedDate).toDate();
    }, [selectedDate]);

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.contentWrapper}>
                        {/* Header & Date Controls */}
                        <Surface style={[styles.card, styles.headerCard]} elevation={1}>
                            <View style={styles.dateNavRow}>
                                <View style={styles.dateNavButtons}>
                                    <IconButton
                                        icon={() => <ChevronLeft size={20} color={NEUTRAL[700]} />}
                                        size={22}
                                        onPress={handlePreviousDay}
                                        style={styles.navIconButton}
                                        accessibilityLabel="Previous day"
                                    />
                                    <IconButton
                                        icon={() => <ChevronRight size={20} color={NEUTRAL[700]} />}
                                        size={22}
                                        onPress={handleNextDay}
                                        style={styles.navIconButton}
                                        accessibilityLabel="Next day"
                                    />
                                    {selectedDate !== dayjs().format('YYYY-MM-DD') && (
                                        <Button
                                            mode="outlined"
                                            compact
                                            onPress={handleToday}
                                            style={styles.todayButton}
                                            labelStyle={styles.todayButtonLabel}
                                        >
                                            Today
                                        </Button>
                                    )}
                                </View>

                                <Pressable
                                    onPress={() => setShowDatePicker(true)}
                                    style={styles.dateDisplayContainer}
                                >
                                    <CalendarIcon size={18} color={BRAND.primary} style={styles.calendarIcon} />
                                    <Text style={styles.dateHeadingText}>{formattedDateHeader}</Text>
                                    {relativeDateTag && (
                                        <Chip
                                            compact
                                            style={styles.relativeChip}
                                            textStyle={styles.relativeChipText}
                                        >
                                            {relativeDateTag}
                                        </Chip>
                                    )}
                                </Pressable>
                            </View>
                        </Surface>

                        {/* Dairy Content Area */}
                        <Surface style={[styles.card, styles.editorCard]} elevation={2}>
                            {/* Editor Top Bar */}
                            <View style={styles.editorTopBar}>
                                <View style={styles.titleInfo}>
                                    <FileText size={18} color={BRAND.primary} style={{ marginRight: 6 }} />
                                    <Text style={styles.editorTitle}>Daily Notes & Reflections</Text>
                                </View>

                                <View style={styles.topBarActions}>
                                    {hasUnsavedChanges && (
                                        <Chip
                                            compact
                                            style={styles.unsavedChip}
                                            textStyle={styles.unsavedChipText}
                                        >
                                            Unsaved Changes
                                        </Chip>
                                    )}

                                    {lastSavedTime && !hasUnsavedChanges && (
                                        <View style={styles.savedStatusContainer}>
                                            <Check size={14} color="#16A34A" style={{ marginRight: 4 }} />
                                            <Text style={styles.savedStatusText}>Saved at {lastSavedTime}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Main Multiline Description Box */}
                            <View style={styles.inputContainer}>
                                {loading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color={BRAND.primary} />
                                        <Text style={styles.loadingText}>Loading daily dairy entry...</Text>
                                    </View>
                                ) : (
                                    <TextInput
                                        mode="outlined"
                                        multiline
                                        value={text}
                                        onChangeText={setText}
                                        placeholder="What happened today? Write your notes, reflections, progress, ideas..."
                                        placeholderTextColor={NEUTRAL[500]}
                                        style={styles.textArea}
                                        outlineColor={NEUTRAL[200]}
                                        activeOutlineColor={BRAND.primary}
                                        textColor={NEUTRAL[900]}
                                        autoFocus={false}
                                    />
                                )}
                            </View>

                            {/* Editor Footer / Stats & Actions */}
                            <View style={styles.editorFooter}>
                                <View style={styles.statsContainer}>
                                    <Text style={styles.statsText}>
                                        {wordCount} {wordCount === 1 ? 'word' : 'words'} · {characterCount} chars
                                    </Text>
                                </View>

                                <View style={styles.footerButtons}>
                                    {hasUnsavedChanges && (
                                        <Button
                                            mode="text"
                                            compact
                                            onPress={handleReset}
                                            icon={() => <RotateCcw size={16} color={NEUTRAL[700]} />}
                                            textColor={NEUTRAL[700]}
                                            style={styles.revertButton}
                                        >
                                            Revert
                                        </Button>
                                    )}

                                    <Button
                                        mode="contained"
                                        onPress={handleSave}
                                        loading={saving}
                                        disabled={saving || (!hasUnsavedChanges && text.length === 0)}
                                        buttonColor={BRAND.primary}
                                        textColor="#FFFFFF"
                                        icon={() => (!saving ? <Save size={18} color="#FFFFFF" /> : null)}
                                        style={styles.saveButton}
                                        contentStyle={styles.saveButtonContent}
                                    >
                                        {initialText ? 'Update Dairy' : 'Save Dairy'}
                                    </Button>
                                </View>
                            </View>
                        </Surface>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Date Picker Modal */}
            {showDatePicker && (
                <CustomDateTimePicker
                    value={selectedDateObj}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) {
                            setSelectedDate(dayjs(date).format('YYYY-MM-DD'));
                        }
                    }}
                    onClose={() => setShowDatePicker(false)}
                />
            )}

            {/* Feedback Snackbar */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={styles.snackbar}
                action={{
                    label: 'Dismiss',
                    onPress: () => setSnackbarVisible(false),
                }}
            >
                {snackbarMessage}
            </Snackbar>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: SURFACE.page,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: IS_WEB ? 24 : 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    contentWrapper: {
        width: '100%',
        maxWidth: 860,
    },
    card: {
        backgroundColor: SURFACE.card,
        borderRadius: RADIUS.md,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: NEUTRAL[200],
    },
    headerCard: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    dateNavRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
    },
    dateNavButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navIconButton: {
        margin: 0,
        backgroundColor: NEUTRAL[100],
        borderRadius: RADIUS.sm,
    },
    todayButton: {
        marginLeft: 8,
        borderColor: BRAND.primary,
        borderRadius: RADIUS.sm,
    },
    todayButtonLabel: {
        fontSize: 12,
        color: BRAND.primary,
        fontWeight: '600',
    },
    dateDisplayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BRAND.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.sm,
    },
    calendarIcon: {
        marginRight: 8,
    },
    dateHeadingText: {
        fontSize: 15,
        fontWeight: '700',
        color: NEUTRAL[900],
        marginRight: 8,
    },
    relativeChip: {
        backgroundColor: BRAND.primary,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    relativeChipText: {
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    editorCard: {
        flex: 1,
        minHeight: IS_WEB ? 550 : 420,
        display: 'flex',
        flexDirection: 'column',
    },
    editorTopBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: NEUTRAL[100],
    },
    titleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editorTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: NEUTRAL[900],
    },
    topBarActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    unsavedChip: {
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#F59E0B',
    },
    unsavedChipText: {
        fontSize: 11,
        color: '#B45309',
        fontWeight: '600',
    },
    savedStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    savedStatusText: {
        fontSize: 12,
        color: '#16A34A',
        fontWeight: '500',
    },
    inputContainer: {
        flex: 1,
        minHeight: IS_WEB ? 380 : 280,
    },
    loadingContainer: {
        flex: 1,
        minHeight: 250,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: NEUTRAL[500],
    },
    textArea: {
        flex: 1,
        minHeight: IS_WEB ? 380 : 280,
        backgroundColor: SURFACE.inputBg,
        fontSize: 15,
        lineHeight: 24,
    },
    editorFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 14,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: NEUTRAL[100],
        flexWrap: 'wrap',
        gap: 10,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statsText: {
        fontSize: 12,
        color: NEUTRAL[500],
    },
    footerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    revertButton: {
        borderRadius: RADIUS.sm,
    },
    saveButton: {
        borderRadius: RADIUS.sm,
        elevation: 2,
    },
    saveButtonContent: {
        paddingHorizontal: 12,
        height: 40,
    },
    snackbar: {
        backgroundColor: NEUTRAL[900],
    },
});
