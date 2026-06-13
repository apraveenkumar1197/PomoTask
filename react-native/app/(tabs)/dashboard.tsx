import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import {
    ActivityIndicator,
    Card,
    Divider,
    Text
} from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { BRAND, NEUTRAL, RADIUS, SHADOWS, SURFACE } from '@/constants/theme';
import DateUtil from '@/src/functionalities/DateUtil';
import General from '@/src/repo/General';
import Goal from '@/src/repo/Goal';
import dayjs from 'dayjs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_WEB = SCREEN_WIDTH > 768;

const SOFT_PINK = '#f06292';

function AnimatedProgressBar({ progress, color, delay = 0 }: { progress: number; color: string; delay?: number }) {
    const width = useSharedValue(0);
    const barStyle = useAnimatedStyle(() => ({ width: `${width.value * 100}%` as any }));

    useEffect(() => {
        width.value = withDelay(delay, withSpring(Math.min(progress, 1), { damping: 20, stiffness: 100 }));
    }, [progress]);

    return (
        <View style={pbStyles.track}>
            <Animated.View style={[pbStyles.fill, { backgroundColor: color }, barStyle]} />
        </View>
    );
}

const pbStyles = StyleSheet.create({
    track: {
        height: 10,
        borderRadius: 5,
        backgroundColor: BRAND.primaryLight,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 5,
    },
});

export default function DashboardScreen() {
    const [details, setDetails] = useState<any>(null);
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [dashiRes, goalsRes] = await Promise.all([
                General.dashiDetails(),
                Goal.listByYearAndMonth(dayjs().year(), DateUtil.MONTH_LIST[dayjs().month()])
            ]);
            setDetails(dashiRes.data.data);
            setGoals(goalsRes.data.data.goals || []);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
        }, [])
    );

    const renderChart = (title: string, data: any[]) => (
        <Card style={styles.card} elevation={0}>
            <Card.Title title={title} titleStyle={styles.cardTitle} />
            <Card.Content style={styles.chartContent}>
                <PieChart
                    data={data}
                    width={IS_WEB ? 350 : SCREEN_WIDTH - 60}
                    height={180}
                    chartConfig={{
                        color: (opacity = 1) => `rgba(98, 100, 167, ${opacity})`,
                    }}
                    accessor={"count"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    center={[10, 0]}
                    absolute
                />
            </Card.Content>
        </Card>
    );

    if (loading && !details) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={BRAND.primary} />
            </View>
        );
    }

    const plannedVsUnplannedData = [
        { name: "Planned", count: details?.planned_vs_unplanned?.planned_count || 0, color: BRAND.primary, legendFontColor: NEUTRAL[500], legendFontSize: 12 },
        { name: "Unplanned", count: details?.planned_vs_unplanned?.un_planned_count || 0, color: SOFT_PINK, legendFontColor: NEUTRAL[500], legendFontSize: 12 },
    ];

    const todoVsDoneData = [
        { name: "Todo", count: details?.daily_metrics?.todo || 0, color: "#FFB900", legendFontColor: NEUTRAL[500], legendFontSize: 12 },
        { name: "Done", count: details?.daily_metrics?.done || 0, color: "#107C10", legendFontColor: NEUTRAL[500], legendFontSize: 12 },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.innerContainer}>
                <ThemedText type="title" style={styles.pageTitle}>Analytics</ThemedText>

                <View style={IS_WEB ? styles.chartsRow : styles.chartsColumn}>
                    <View style={IS_WEB ? { flex: 1 } : null}>
                        {renderChart("Planned vs Unplanned", plannedVsUnplannedData)}
                    </View>
                    <View style={IS_WEB ? { flex: 1, marginLeft: 16 } : null}>
                        {renderChart("Today's Progress", todoVsDoneData)}
                    </View>
                </View>

                <Card style={styles.card} elevation={0}>
                    <Card.Title title="Monthly Goals" titleStyle={styles.cardTitle} />
                    <Card.Content>
                        {goals.length === 0 ? (
                            <Text style={styles.emptyText}>No goals set for this month</Text>
                        ) : (
                            goals.map((goal, idx) => (
                                <View key={idx} style={styles.goalItem}>
                                    <View style={styles.goalHeader}>
                                        <Text style={styles.goalName}>{goal.title}</Text>
                                        <Text style={styles.goalProgress}>{goal.progress || 0}%</Text>
                                    </View>
                                    <AnimatedProgressBar
                                        progress={(goal.progress || 0) / 100}
                                        color={BRAND.primary}
                                        delay={idx * 80}
                                    />
                                    {idx < goals.length - 1 && <Divider style={styles.divider} />}
                                </View>
                            ))
                        )}
                    </Card.Content>
                </Card>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: SURFACE.page,
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    innerContainer: {
        width: '100%',
        maxWidth: 800,
        paddingHorizontal: 16,
    },
    pageTitle: {
        marginBottom: 24,
        marginTop: 32,
        fontSize: 32,
        fontWeight: '800',
        color: NEUTRAL[900],
        letterSpacing: -0.5,
    },
    chartsRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    chartsColumn: {
        flexDirection: 'column',
    },
    card: {
        marginBottom: 20,
        borderRadius: RADIUS.lg,
        backgroundColor: '#fff',
        ...Platform.select({
            web: SHADOWS.web.md as any,
            default: SHADOWS.native.sm,
        }),
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: NEUTRAL[900],
        letterSpacing: -0.1,
    },
    chartContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
    },
    goalItem: {
        paddingVertical: 12,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    goalName: {
        fontSize: 15,
        color: NEUTRAL[900],
        fontWeight: '600',
    },
    goalProgress: {
        fontSize: 15,
        color: BRAND.primary,
        fontWeight: '700',
    },
    divider: {
        marginTop: 12,
        backgroundColor: '#F0F0F8',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: NEUTRAL[500],
        padding: 20,
        fontStyle: 'italic',
    },
});
