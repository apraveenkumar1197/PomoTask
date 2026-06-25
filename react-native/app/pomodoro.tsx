import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BRAND, NEUTRAL, RADIUS, SHADOWS, SURFACE } from '@/constants/theme';
import Task from '@/src/repo/Task';
import { Audio } from 'expo-av';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Pause, Play, Settings2 } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, Modal, Portal, SegmentedButtons, Surface, Text, TextInput } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_WEB = SCREEN_WIDTH > 768;

export default function PomodoroScreen() {
    const { taskId, taskTitle } = useLocalSearchParams();

    const [timerMode, setTimerMode] = useState('pomo');
    const [pomoLength, setPomoLength] = useState(25);
    const [shortLength, setShortLength] = useState(5);
    const [longLength, setLongLength] = useState(15);
    const [secondsLeft, setSecondsLeft] = useState(pomoLength * 60);
    const [workCycles, setWorkCycles] = useState(0);
    const CYCLES_BEFORE_LONG_BREAK = 4;

    const [overallSeconds, setOverallSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [sound, setSound] = useState<Audio.Sound>();
    const [sessions, setSessions] = useState<any[]>([]);
    const initTimeRef = useRef<number | null>(null);

    // Timer pulse animation
    const timerScale = useSharedValue(1);
    const timerAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: timerScale.value }] }));

    const TIMES: any = { pomo: pomoLength, short: shortLength, long: longLength };
    const totalSeconds = TIMES[timerMode] * 60;
    const progress = (totalSeconds - secondsLeft) / totalSeconds;

    const fetchHistory = () => {
        if (taskId) {
            Task.getTaskTimingHistory(taskId as string)
                .then((res: any) => setSessions(res.data.data.sessions || []))
                .catch((err: any) => console.error("Error fetching timing history:", err));
        }
    };

    useEffect(() => {
        if (taskId) {
            Task.getTaskTimerStatus(taskId as string).then((res) => {
                const { task_timing, pomodoro } = res.data.data;
                setOverallSeconds(task_timing.total_seconds || 0);
                setIsActive(task_timing.status === 'started');
                if (pomodoro) {
                    setPomoLength(Math.round((pomodoro.work || 1500) / 60));
                    setShortLength(Math.round((pomodoro.short_break || 300) / 60));
                    setLongLength(Math.round((pomodoro.long_break || 900) / 60));
                }
            }).catch(err => console.error("Error fetching timer status:", err));
            fetchHistory();
        }
    }, [taskId]);

    useEffect(() => {
        let interval: any = null;
        if (isActive) {
            initTimeRef.current = Date.now();
            interval = setInterval(() => {
                setSecondsLeft((prev) => {
                    if (prev <= 1) {
                        handleAutoSwitch();
                        return 0;
                    }
                    return prev - 1;
                });
                setOverallSeconds(prev => prev + 1);
            }, 1000);
        } else {
            initTimeRef.current = null;
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, timerMode]);

    useEffect(() => {
        setSecondsLeft(TIMES[timerMode] * 60);
    }, [timerMode, pomoLength, shortLength, longLength]);

    const handleAutoSwitch = () => {
        playSound();
        timerScale.value = withSequence(
            withSpring(1.08, { damping: 5, stiffness: 200 }),
            withSpring(1.0, { damping: 10, stiffness: 200 })
        );
        if (timerMode === 'pomo') {
            const nextCycle = workCycles + 1;
            if (nextCycle >= CYCLES_BEFORE_LONG_BREAK) {
                setWorkCycles(0);
                setTimerMode('long');
            } else {
                setWorkCycles(nextCycle);
                setTimerMode('short');
            }
        } else {
            setTimerMode('pomo');
        }
        setIsActive(false);
        updateBackendStatus(false);
    };

    async function playSound() {
        try {
            const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/timesUp.mp3'));
            setSound(sound);
            await sound.playAsync();
        } catch (e) {
            console.log("Error playing sound", e);
        }
    }

    useEffect(() => {
        return sound ? () => { sound.unloadAsync(); } : undefined;
    }, [sound]);

    const resetTimer = () => {
        setIsActive(false);
        updateBackendStatus(false);
        setSecondsLeft(TIMES[timerMode] * 60);
        setWorkCycles(0);
    };

    const updateBackendStatus = async (status: boolean) => {
        if (taskId) {
            try {
                await Task.taskTimerStatusUpdate(taskId as string, status ? 'started' : 'stopped');
                if (!status) fetchHistory();
            } catch (err) {
                console.error("Failed to update backend timer:", err);
            }
        }
    };

    const toggleTimer = () => {
        const nextState = !isActive;
        setIsActive(nextState);
        updateBackendStatus(nextState);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const formatOverallTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatSessionTime = (isoString: string) => {
        const d = new Date(isoString);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatSessionDate = (isoString: string) => {
        const d = new Date(isoString);
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    const btnColor = isActive ? '#EA4335' : BRAND.primary;
    const btnShadow = Platform.select({
        web: { boxShadow: isActive ? '0 4px 16px rgba(234,67,53,0.35)' : '0 4px 16px rgba(98,100,167,0.35)' } as any,
        default: isActive
            ? { elevation: 6, shadowColor: '#EA4335', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 8 }
            : { elevation: 6, shadowColor: BRAND.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 8 },
    });

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{
                title: (taskTitle as string) || "Pomodoro",
                headerTitleAlign: 'center',
                headerStyle: { backgroundColor: '#FFFFFF' } as any,
                headerTitleStyle: { color: NEUTRAL[900], fontWeight: '700', fontSize: 17 },
                headerTintColor: BRAND.primary,
            }} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            <View style={[styles.mainLayout, !IS_WEB && styles.mainLayoutMobile]}>
                {/* Left Section: Overall Task Timer */}
                <Surface style={[styles.timerCard, !IS_WEB && styles.timerCardMobile]} elevation={0}>
                    <View style={styles.cardAccentBand} />
                    <Text style={styles.cardTitle}>Overall Time</Text>
                    <Text style={styles.overallTimerText}>{formatOverallTime(overallSeconds)}</Text>

                    <Button
                        mode="contained"
                        onPress={toggleTimer}
                        icon={isActive ? () => <Pause size={20} color="white" /> : () => <Play size={20} color="white" />}
                        style={[styles.mainButton, { backgroundColor: btnColor }, btnShadow as any]}
                        contentStyle={styles.mainButtonContent}
                        labelStyle={styles.mainButtonLabel}
                    >
                        {isActive ? 'STOP' : 'START'}
                    </Button>
                </Surface>

                {/* Right Section: Pomodoro Timer */}
                <Surface style={[styles.timerCard, !IS_WEB && styles.timerCardMobile, styles.pomodoroCard]} elevation={0}>
                    <View style={[styles.cardAccentBand, { backgroundColor: BRAND.primaryMid }]} />
                    <Text style={[styles.cardTitle, { color: BRAND.primary }]}>Pomodoro Timer</Text>

                    <SegmentedButtons
                        value={timerMode}
                        onValueChange={setTimerMode}
                        buttons={[
                            { value: 'pomo', label: 'Work', checkedColor: '#fff', uncheckedColor: NEUTRAL[500] },
                            { value: 'short', label: 'Short', checkedColor: '#fff', uncheckedColor: NEUTRAL[500] },
                            { value: 'long', label: 'Long', checkedColor: '#fff', uncheckedColor: NEUTRAL[500] },
                        ]}
                        theme={{
                            colors: {
                                secondaryContainer: BRAND.primary,
                                onSecondaryContainer: 'white',
                            }
                        }}
                        style={styles.segmentedButtons}
                    />

                    <View style={styles.pomodoroFocusArea}>
                        <Text style={styles.modeIndicator}>
                            {timerMode === 'pomo' ? 'FOCUS SESSION' : 'BREAK TIME'}
                        </Text>
                        <Animated.Text style={[styles.pomodoroTimerText, timerAnimStyle]}>
                            {formatTime(secondsLeft)}
                        </Animated.Text>

                        {/* Custom progress bar */}
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
                        </View>
                    </View>

                    <View style={styles.pomodoroFooter}>
                        <Button mode="outlined" onPress={resetTimer} style={styles.resetBtn} textColor={BRAND.primary}>
                            RESET
                        </Button>
                        <View style={styles.setsWrapper}>
                            {[...Array(CYCLES_BEFORE_LONG_BREAK)].map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.setIndicator,
                                        i < workCycles && styles.setIndicatorActive,
                                    ]}
                                />
                            ))}
                        </View>
                    </View>

                    <IconButton
                        icon={() => <Settings2 color={NEUTRAL[500]} size={20} />}
                        onPress={() => setSettingsVisible(true)}
                        style={styles.settingsIcon}
                    />
                </Surface>
            </View>

            {/* Session History */}
            <View style={[styles.historySection, !IS_WEB && styles.historySectionMobile]}>
                <Text style={styles.historyTitle}>SESSION HISTORY</Text>
                {sessions.length === 0 ? (
                    <Text style={styles.historyEmpty}>No sessions recorded yet.</Text>
                ) : (
                    sessions.map((session, index) => (
                        <View key={index} style={styles.historyRow}>
                            <View style={[styles.historyDot, !session.stopped_at && styles.historyDotActive]} />
                            <View style={styles.historyRowContent}>
                                <Text style={styles.historyDate}>{formatSessionDate(session.started_at)}</Text>
                                <Text style={styles.historyTime}>
                                    {formatSessionTime(session.started_at)}
                                    {' → '}
                                    {session.stopped_at ? formatSessionTime(session.stopped_at) : <Text style={styles.historyActive}>Active</Text>}
                                </Text>
                            </View>
                            <Text style={[styles.historyDuration, !session.stopped_at && styles.historyDurationActive]}>
                                {formatDuration(session.duration_seconds)}
                            </Text>
                        </View>
                    ))
                )}
            </View>

            </ScrollView>

            <Portal>
                <Modal
                    visible={settingsVisible}
                    onDismiss={() => setSettingsVisible(false)}
                    contentContainerStyle={styles.modalContent}
                >
                    <View style={styles.modalHeader}>
                        <ThemedText type="subtitle" style={styles.modalTitle}>Settings</ThemedText>
                        <IconButton icon="close" size={20} onPress={() => setSettingsVisible(false)} />
                    </View>
                    <TextInput
                        label="Focus (mins)"
                        value={pomoLength.toString()}
                        onChangeText={(text) => setPomoLength(parseInt(text) || 0)}
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.input}
                        textColor="#000"
                        outlineColor="#E0E0F0"
                        activeOutlineColor={BRAND.primary}
                    />
                    <TextInput
                        label="Short Break (mins)"
                        value={shortLength.toString()}
                        onChangeText={(text) => setShortLength(parseInt(text) || 0)}
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.input}
                        textColor="#000"
                        outlineColor="#E0E0F0"
                        activeOutlineColor={BRAND.primary}
                    />
                    <TextInput
                        label="Long Break (mins)"
                        value={longLength.toString()}
                        onChangeText={(text) => setLongLength(parseInt(text) || 0)}
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.input}
                        textColor="#000"
                        outlineColor="#E0E0F0"
                        activeOutlineColor={BRAND.primary}
                    />
                    <Button
                        mode="contained"
                        onPress={() => setSettingsVisible(false)}
                        style={styles.saveBtn}
                        buttonColor={BRAND.primary}
                    >
                        Save Settings
                    </Button>
                </Modal>
            </Portal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: SURFACE.page,
    },
    scrollContent: {
        flexGrow: 1,
    },
    mainLayout: {
        flexDirection: 'row',
        padding: 20,
        gap: 20,
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
        minHeight: IS_WEB ? 520 : undefined,
    },
    mainLayoutMobile: {
        flexDirection: 'column',
    },
    timerCard: {
        flex: 1,
        padding: 30,
        borderRadius: 28,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        ...Platform.select({
            web: SHADOWS.web.lg as any,
            default: SHADOWS.native.lg,
        }),
    },
    timerCardMobile: {
        width: '100%',
        padding: 20,
    },
    pomodoroCard: {
        backgroundColor: '#F7F8FC',
    },
    cardAccentBand: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: BRAND.primary,
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: NEUTRAL[500],
        letterSpacing: 2,
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    overallTimerText: {
        fontSize: IS_WEB ? 68 : 52,
        fontWeight: '800',
        color: NEUTRAL[900],
        fontVariant: ['tabular-nums'],
        marginBottom: IS_WEB ? 40 : 20,
        letterSpacing: -1,
    },
    pomodoroFocusArea: {
        alignItems: 'center',
        marginVertical: IS_WEB ? 36 : 16,
        width: '100%',
    },
    modeIndicator: {
        fontSize: 11,
        fontWeight: '700',
        color: BRAND.primary,
        marginBottom: 10,
        letterSpacing: 1.5,
    },
    pomodoroTimerText: {
        fontSize: IS_WEB ? 96 : 72,
        fontWeight: '800',
        color: BRAND.primary,
        fontVariant: ['tabular-nums'],
        letterSpacing: -2,
    },
    progressTrack: {
        width: '80%',
        height: 8,
        borderRadius: 4,
        backgroundColor: BRAND.primaryLight,
        marginTop: 20,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: BRAND.primary,
    },
    pomodoroFooter: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    setsWrapper: {
        flexDirection: 'row',
        gap: 8,
    },
    setIndicator: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#D0D0E8',
        backgroundColor: 'transparent',
    },
    setIndicatorActive: {
        backgroundColor: BRAND.primary,
        borderColor: BRAND.primary,
        ...Platform.select({
            default: { elevation: 2, shadowColor: BRAND.primary, shadowOpacity: 0.3, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
        }),
    },
    resetBtn: {
        borderRadius: RADIUS.sm,
        borderColor: BRAND.primaryLight,
    },
    mainButton: {
        width: IS_WEB ? 200 : 160,
        height: IS_WEB ? 64 : 54,
        borderRadius: IS_WEB ? 32 : 27,
        justifyContent: 'center',
    },
    mainButtonContent: {
        height: IS_WEB ? 64 : 54,
    },
    mainButtonLabel: {
        fontSize: IS_WEB ? 18 : 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    settingsIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    segmentedButtons: {
        width: '100%',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 24,
        margin: 20,
        borderRadius: RADIUS.xl,
        maxWidth: 500,
        alignSelf: 'center',
        width: '90%',
        ...Platform.select({
            web: SHADOWS.web.modal as any,
            default: SHADOWS.native.modal,
        }),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    input: {
        marginBottom: 16,
        backgroundColor: SURFACE.inputBg,
    },
    saveBtn: {
        marginTop: 8,
        height: 48,
        justifyContent: 'center',
        borderRadius: RADIUS.md,
    },
    historySection: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    historySectionMobile: {
        paddingHorizontal: 16,
    },
    historyTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: NEUTRAL[500],
        letterSpacing: 2,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    historyEmpty: {
        fontSize: 14,
        color: NEUTRAL[400],
        textAlign: 'center',
        paddingVertical: 16,
    },
    historyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: RADIUS.md,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 8,
        gap: 12,
        ...Platform.select({
            web: { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' } as any,
            default: { elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
        }),
    },
    historyDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: NEUTRAL[300],
    },
    historyDotActive: {
        backgroundColor: '#34A853',
    },
    historyRowContent: {
        flex: 1,
    },
    historyDate: {
        fontSize: 11,
        color: NEUTRAL[400],
        marginBottom: 2,
    },
    historyTime: {
        fontSize: 14,
        color: NEUTRAL[700],
        fontWeight: '500',
    },
    historyActive: {
        color: '#34A853',
        fontWeight: '600',
    },
    historyDuration: {
        fontSize: 13,
        fontWeight: '700',
        color: NEUTRAL[600],
    },
    historyDurationActive: {
        color: '#34A853',
    },
});
