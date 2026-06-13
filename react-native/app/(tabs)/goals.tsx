import { ThemedView } from '@/components/themed-view';
import { BRAND, NEUTRAL, RADIUS, SURFACE } from '@/constants/theme';
import DateUtil from '@/src/functionalities/DateUtil';
import Goal from '@/src/repo/Goal';
import dayjs from 'dayjs';
import { Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import CreateMonthlyGoalModal from '../../components/CreateMonthlyGoalModal';
import CreateYearlyGoalModal from '../../components/CreateYearlyGoalModal';
import MonthlyGoalList from '../../components/MonthlyGoalList';
import YearlyGoalList from '../../components/YearlyGoalList';

const YEARS = [-1, 0, 1, 2].map((i) => dayjs().year() + i);

export default function GoalsScreen() {
    const { width } = useWindowDimensions();
    const isWide = Platform.OS === 'web' && width > 768;

    const [year, setYear] = useState(dayjs().year());
    const [month, setMonth] = useState(DateUtil.MONTH_LIST[dayjs().month()]);

    const [yearlyReload, setYearlyReload] = useState(false);
    const [monthlyReload, setMonthlyReload] = useState(false);

    // Yearly goal modal
    const [yearlyModalVisible, setYearlyModalVisible] = useState(false);
    const [editYearlyGoalId, setEditYearlyGoalId] = useState<string | null>(null);

    // Monthly goal modal
    const [monthlyModalVisible, setMonthlyModalVisible] = useState(false);
    const [editMonthlyGoalId, setEditMonthlyGoalId] = useState<string | null>(null);

    const handleEditYearlyGoal = async (goal: any) => {
        setEditYearlyGoalId(goal.id);
        setYearlyModalVisible(true);
    };

    const handleDeleteYearlyGoal = async (goal: any) => {
        const doDelete = async () => {
            try {
                await Goal.deleteGoal(goal.id);
                setYearlyReload((v) => !v);
            } catch (err) {
                console.error('Failed to delete goal', err);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Delete this yearly goal?')) doDelete();
        } else {
            Alert.alert('Delete Goal', 'Delete this yearly goal?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: doDelete },
            ]);
        }
    };

    const handleEditMonthlyGoal = async (goal: any) => {
        setEditMonthlyGoalId(goal.id);
        setMonthlyModalVisible(true);
    };

    const handleDeleteMonthlyGoal = async (goal: any) => {
        const doDelete = async () => {
            try {
                await Goal.deleteGoal(goal.id);
                setMonthlyReload((v) => !v);
            } catch (err) {
                console.error('Failed to delete goal', err);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Delete this monthly goal?')) doDelete();
        } else {
            Alert.alert('Delete Goal', 'Delete this monthly goal?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: doDelete },
            ]);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Year selector */}
                <View style={styles.selectorRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearChips}>
                        {YEARS.map((y) => (
                            <FAB
                                key={y}
                                label={y.toString()}
                                onPress={() => setYear(y)}
                                style={[styles.yearChip, year === y && styles.activeYearChip]}
                                color={year === y ? '#fff' : NEUTRAL[500]}
                                customSize={36}
                            />
                        ))}
                    </ScrollView>
                </View>

                <View style={isWide ? styles.webLayout : styles.mobileLayout}>
                    {/* Yearly Goals Section */}
                    <View style={isWide ? styles.webColumn : styles.mobileSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Yearly Goals ({year})</Text>
                            <FAB
                                icon={() => <Plus size={18} color="#fff" />}
                                onPress={() => {
                                    setEditYearlyGoalId(null);
                                    setYearlyModalVisible(true);
                                }}
                                style={styles.addFab}
                                customSize={36}
                            />
                        </View>
                        <YearlyGoalList
                            year={year}
                            listReload={yearlyReload}
                            onEdit={handleEditYearlyGoal}
                            onDelete={handleDeleteYearlyGoal}
                            highlightMonth={month}
                        />
                    </View>

                    {/* Monthly Goals Section */}
                    <View style={isWide ? styles.webColumn : styles.mobileSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Monthly Goals</Text>
                            <FAB
                                icon={() => <Plus size={18} color="#fff" />}
                                onPress={() => {
                                    setEditMonthlyGoalId(null);
                                    setMonthlyModalVisible(true);
                                }}
                                style={styles.addFab}
                                customSize={36}
                            />
                        </View>

                        {/* Month selector */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthSelector}>
                            <View style={styles.monthChips}>
                                {DateUtil.MONTH_LIST.map((m: string) => (
                                    <FAB
                                        key={m}
                                        label={m}
                                        onPress={() => setMonth(m)}
                                        style={[styles.monthChip, month === m && styles.activeMonthChip]}
                                        color={month === m ? '#fff' : NEUTRAL[500]}
                                        customSize={32}
                                    />
                                ))}
                            </View>
                        </ScrollView>

                        <MonthlyGoalList
                            year={year}
                            month={month}
                            listReload={monthlyReload}
                            onEdit={handleEditMonthlyGoal}
                            onDelete={handleDeleteMonthlyGoal}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Modals */}
            <CreateYearlyGoalModal
                visible={yearlyModalVisible}
                onDismiss={() => {
                    setYearlyModalVisible(false);
                    setEditYearlyGoalId(null);
                }}
                onGoalSaved={() => setYearlyReload((v) => !v)}
                year={year}
                editGoalId={editYearlyGoalId}
            />

            <CreateMonthlyGoalModal
                visible={monthlyModalVisible}
                onDismiss={() => {
                    setMonthlyModalVisible(false);
                    setEditMonthlyGoalId(null);
                }}
                onGoalSaved={() => setMonthlyReload((v) => !v)}
                year={year}
                month={month}
                editGoalId={editMonthlyGoalId}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: SURFACE.page,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    selectorRow: {
        marginBottom: 16,
    },
    yearChips: {
        flexDirection: 'row',
        gap: 8,
    },
    yearChip: {
        backgroundColor: '#F0F0F8',
        elevation: 0,
        borderRadius: RADIUS.md,
    },
    activeYearChip: {
        backgroundColor: BRAND.primary,
        elevation: 2,
    },
    webLayout: {
        flexDirection: 'row',
        gap: 24,
    },
    mobileLayout: {
        flexDirection: 'column',
        gap: 24,
    },
    webColumn: {
        flex: 1,
    },
    mobileSection: {
        width: '100%',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: NEUTRAL[900],
        letterSpacing: -0.2,
    },
    addFab: {
        backgroundColor: BRAND.primary,
        elevation: 0,
        borderRadius: RADIUS.md,
        ...Platform.select({
            web: { boxShadow: '0 2px 10px rgba(98,100,167,0.30)' } as any,
            default: { elevation: 3, shadowColor: BRAND.primary, shadowOpacity: 0.30, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
        }),
    },
    monthSelector: {
        marginBottom: 12,
        flexGrow: 0,
    },
    monthChips: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'flex-start',
        paddingVertical: 4,
    },
    monthChip: {
        backgroundColor: '#F0F0F8',
        elevation: 0,
        borderRadius: RADIUS.md,
    },
    activeMonthChip: {
        backgroundColor: BRAND.primary,
        elevation: 2,
    },
});
