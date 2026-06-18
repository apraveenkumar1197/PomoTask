import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Clock } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
    ActivityIndicator,
    IconButton,
    SegmentedButtons,
    Text
} from 'react-native-paper';

import { ThemedView } from '@/components/themed-view';
import ActivityAddModal, { ACTIVITY_COLOR } from '@/components/ActivityAddModal';
import TaskAddModal from '@/components/TaskAddModal';
import { BRAND } from '@/constants/theme';
import Task from '@/src/repo/Task';
import dayjs from 'dayjs';

export default function CalendarScreen() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('timeGridWeek');
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const calendarRef = useRef<FullCalendar>(null);
    const isFetching = useRef(false);
    const isMounted = useRef(false);

    const [addModalVisible, setAddModalVisible] = useState(false);
    const [activityModalVisible, setActivityModalVisible] = useState(false);
    const [slotDate, setSlotDate] = useState<Date | null>(null);
    const [slotFromTime, setSlotFromTime] = useState<Date | null>(null);
    const [slotToTime, setSlotToTime] = useState<Date | null>(null);
    const [creationMode, setCreationMode] = useState<'task' | 'activity'>('task');

    const isShiftHeld = useRef(false);
    useEffect(() => {
        if (Platform.OS !== 'web') return;
        const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Shift') isShiftHeld.current = true; };
        const onKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') isShiftHeld.current = false; };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, []);

    const fetchCalendarTasks = async () => {
        if (isFetching.current) return;
        isFetching.current = true;
        setLoading(true);
        try {
            console.log("Fetching calendar tasks...");
            const res = await Task.calendarTaskList();

            let tasks = [];
            if (res?.data?.data?.tasks) {
                tasks = res.data.data.tasks;
            } else if (res?.data?.tasks) {
                tasks = res.data.tasks;
            } else if (Array.isArray(res?.data)) {
                tasks = res.data;
            }

            console.log(`Found ${tasks.length} tasks in response`);

            const mappedEvents = tasks.map((task: any) => {
                const start = task.start || task.from_time || task.taskFromTime;
                const end = task.end || task.to_time || task.taskToTime;
                const title = task.title || task.taskTitle || "Untitled";
                const id = (task.event_id || task.id || Math.random()).toString();

                const isActivity = task.record_type === 'activity';
                const eventColor = isActivity ? ACTIVITY_COLOR : (task.color || BRAND.primary);
                return {
                    id,
                    title,
                    start: dayjs(start).toISOString(),
                    end: dayjs(end).toISOString(),
                    backgroundColor: eventColor,
                    borderColor: eventColor,
                    textColor: '#ffffff',
                    extendedProps: { ...task }
                };
            }).filter((e: any) => e.start && e.start !== 'Invalid Date');

            console.log(`Mapped ${mappedEvents.length} events for FullCalendar`);
            setEvents(mappedEvents);
        } catch (err) {
            console.error("Failed to fetch calendar tasks", err);
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    };

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            fetchCalendarTasks();
        }
    }, []);

    const onEventDrop = useCallback(async (info: any) => {
        const { event } = info;
        try {
            // Function to round a date to the nearest N minutes
            const roundToNearestMinutes = (date: Date, minutes: number) => {
                const ms = 1000 * 60 * minutes;
                return new Date(Math.round(date.getTime() / ms) * ms);
            };

            const snappedStart = roundToNearestMinutes(event.start, 15);
            const snappedEnd = event.end ? roundToNearestMinutes(event.end, 15) : snappedStart;

            const startStr = snappedStart.toISOString();
            const endStr = snappedEnd.toISOString();

            // Optimistic update
            setEvents(prev => prev.map(e =>
                e.id === event.id ? { ...e, start: startStr, end: endStr } : e
            ));

            const taskFromTime = dayjs(startStr).format('HH:mm:ss');
            const taskToTime = dayjs(endStr).format('HH:mm:ss');
            const taskDueDate = dayjs(startStr).format('YYYY-MM-DD');

            await Task.update(
                event.id,
                event.title || "",
                null,
                null,
                null,
                taskDueDate,
                taskFromTime,
                taskToTime
            );
        } catch (err) {
            console.error("Failed to update task", err);
            fetchCalendarTasks();
        }
    }, []);

    const goToToday = () => {
        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.today();
        setSelectedDate(dayjs(calendarApi?.getDate()).format('YYYY-MM-DD'));
    };

    const goToNext = () => {
        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.next();
        setSelectedDate(dayjs(calendarApi?.getDate()).format('YYYY-MM-DD'));
    };

    const goToPrev = () => {
        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.prev();
        setSelectedDate(dayjs(calendarApi?.getDate()).format('YYYY-MM-DD'));
    };

    const handleViewChange = (value: string) => {
        setViewMode(value);
        calendarRef.current?.getApi().changeView(value);
    };

    const handleSelect = useCallback((info: any) => {
        setSlotDate(info.start);
        setSlotFromTime(info.start);
        setSlotToTime(info.end);
        if (isShiftHeld.current || creationMode === 'activity') {
            setActivityModalVisible(true);
        } else {
            setAddModalVisible(true);
        }
        calendarRef.current?.getApi().unselect();
    }, [creationMode]);

    if (Platform.OS !== 'web') {
        return (
            <ThemedView style={styles.container}>
                <View style={styles.center}>
                    <Text>FullCalendar is optimized for Web. Native support coming soon.</Text>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <IconButton
                        icon="chevron-left"
                        onPress={goToPrev}
                        iconColor={BRAND.primary}
                    />
                    <Text style={styles.dateText}>
                        {dayjs(selectedDate).format('dddd, D MMM YYYY')}
                    </Text>
                    <IconButton
                        icon="chevron-right"
                        onPress={goToNext}
                        iconColor={BRAND.primary}
                    />
                    <IconButton
                        icon="target"
                        onPress={goToToday}
                        style={styles.todayButton}
                        iconColor={BRAND.primary}
                    />
                    <IconButton icon="refresh" onPress={fetchCalendarTasks} />
                </View>
                <SegmentedButtons
                    value={viewMode}
                    onValueChange={handleViewChange}
                    buttons={[
                        { value: 'timeGridDay', label: 'Day', checkedColor: BRAND.primary, uncheckedColor: '#b0aeae' },
                        { value: 'timeGridWeek', label: 'Week', checkedColor: BRAND.primary, uncheckedColor: '#b0aeae' },
                        { value: 'dayGridMonth', label: 'Month', checkedColor: BRAND.primary, uncheckedColor: '#b0aeae' },
                        { value: 'listWeek', label: 'List', checkedColor: BRAND.primary, uncheckedColor: '#b0aeae' },
                    ]}
                    theme={{
                        colors: {
                            secondaryContainer: BRAND.primary,
                            onSecondaryContainer: 'white'
                        }
                    }}
                    style={styles.segmentedButtons}
                />

                <View style={styles.legend}>
                    <TouchableOpacity
                        style={[
                            styles.legendItem,
                            creationMode === 'task' && [styles.legendItemActive, { borderColor: BRAND.primary }],
                        ]}
                        onPress={() => setCreationMode('task')}
                    >
                        <View style={[styles.legendDot, { backgroundColor: BRAND.primary }]} />
                        <Text style={styles.legendLabel}>Task</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.legendItem,
                            creationMode === 'activity' && [styles.legendItemActive, { borderColor: ACTIVITY_COLOR }],
                        ]}
                        onPress={() => setCreationMode('activity')}
                    >
                        <View style={[styles.legendDot, { backgroundColor: ACTIVITY_COLOR }]} />
                        <Text style={styles.legendLabel}>Activity</Text>
                    </TouchableOpacity>
                    <Text style={styles.legendHint}>
                        Drag to create a {creationMode}{Platform.OS === 'web' ? ' · Shift+drag for activity' : ''}
                    </Text>
                </View>
            </View>

            <View style={styles.calendarWrapper}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    initialView={viewMode}
                    headerToolbar={false}
                    events={events}
                    editable={true}
                    droppable={true}
                    selectable={true}
                    selectMirror={true}
                    select={handleSelect}
                    dayMaxEvents={true}
                    weekends={true}
                    nowIndicator={true}
                    height="100%"
                    handleWindowResize={true}
                    slotDuration="00:30:00"
                    snapDuration="00:15:00"
                    eventSnapDuration="00:15:00"
                    allDaySlot={false}
                    eventChange={onEventDrop}
                    eventDidMount={(info) => {
                        const isActivity = info.event.extendedProps?.record_type === 'activity';
                        if (isActivity) {
                            info.el.style.background = ACTIVITY_COLOR;
                            info.el.style.boxShadow = `0 2px 6px ${ACTIVITY_COLOR}80`;
                        } else {
                            info.el.style.background = 'linear-gradient(135deg, #6264A7, #464775)';
                            info.el.style.boxShadow = '0 2px 6px rgba(98,100,167,0.30)';
                        }
                    }}
                    longPressDelay={50}
                    eventLongPressDelay={50}
                    selectLongPressDelay={50}
                    datesSet={(arg) => {
                        setSelectedDate(dayjs(arg.view.currentStart).format('YYYY-MM-DD'));
                    }}
                    eventContent={(eventInfo) => (
                        <View style={styles.eventContent}>
                            <Text style={styles.eventTitle} numberOfLines={1}>{eventInfo.event.title}</Text>
                            <View style={styles.eventTimeRow}>
                                <Clock size={10} color="white" />
                                <Text style={styles.eventTime}>
                                    {eventInfo.timeText}
                                </Text>
                            </View>
                        </View>
                    )}
                />

                {events.length === 0 && !loading && (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No tasks found.</Text>
                        <Text style={styles.emptySubText}>Try refreshing or check other dates.</Text>
                    </View>
                )}
            </View>

            {loading && (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator animating={true} color={BRAND.primary} size="large" />
                </View>
            )}
            <TaskAddModal
                visible={addModalVisible}
                onDismiss={() => setAddModalVisible(false)}
                onTaskAdded={() => {
                    setAddModalVisible(false);
                    fetchCalendarTasks();
                }}
                initialDate={slotDate}
                initialFromTime={slotFromTime}
                initialToTime={slotToTime}
            />

            <ActivityAddModal
                visible={activityModalVisible}
                onDismiss={() => setActivityModalVisible(false)}
                onActivityAdded={() => {
                    setActivityModalVisible(false);
                    fetchCalendarTasks();
                }}
                initialDate={slotDate}
                initialFromTime={slotFromTime}
                initialToTime={slotToTime}
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                .fc {
                    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #FAFAFE;
                    padding: 10px;
                    height: 100% !important;
                }
                .fc-scroller { overflow-y: auto !important; }
                .fc-header-toolbar { margin-bottom: 20px !important; }
                .fc-button-primary {
                    background-color: #6264A7 !important;
                    border-color: #6264A7 !important;
                    text-transform: capitalize;
                    border-radius: 8px !important;
                }
                .fc-button-primary:hover {
                    background-color: #464775 !important;
                    border-color: #464775 !important;
                }
                .fc-col-header-cell {
                    background: linear-gradient(135deg, #EEEEF7, #F7F8FC);
                    padding: 10px 0 !important;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    color: #6264A7;
                }
                .fc-event {
                    border: none !important;
                    padding: 2px 5px;
                    border-radius: 6px !important;
                    cursor: pointer;
                }
                .fc-event-title { font-weight: 600; font-size: 0.85em; }
                .fc-event-time { font-size: 0.75em; opacity: 0.85; }
                .fc-timegrid-slot { height: 60px !important; }
                .fc-timegrid-now-indicator-line { border-color: #EA4335 !important; border-width: 2px !important; }
                .fc-theme-standard td, .fc-theme-standard th { border-color: #E0E0F0 !important; }
                .fc-timegrid-slot-label { font-size: 11px; color: #6B7280; font-weight: 600; }
                .fc-day-today { background-color: #EEEEF7 !important; }
                .fc-active-view { background-color: #FAFAFE; }
            `}} />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFE',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0F0',
        backgroundColor: '#FAFAFE',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
        textAlign: 'center',
        letterSpacing: -0.1,
    },
    todayButton: {
        marginRight: -8,
    },
    segmentedButtons: {
        flexGrow: 0,
        flexShrink: 0,
        borderRadius: 10,
    },
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingTop: 10,
        flexWrap: 'wrap',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1.5,
        borderColor: 'transparent',
        borderRadius: 14,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    legendItemActive: {
        backgroundColor: '#F4F4FB',
    },
    legendDot: {
        width: 9,
        height: 9,
        borderRadius: 4.5,
    },
    legendLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    legendHint: {
        fontSize: 11,
        color: '#9CA3AF',
        marginLeft: 'auto' as any,
    },
    calendarWrapper: {
        flex: 1,
        padding: 8,
        minHeight: 600,
    },
    eventContent: {
        padding: 2,
    },
    eventTitle: {
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
    },
    eventTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 1,
    },
    eventTime: {
        color: 'white',
        fontSize: 9,
        marginLeft: 4,
    },
    loaderContainer: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    emptyContainer: {
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        alignItems: 'center',
        pointerEvents: 'none',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#605E5C',
    },
    emptySubText: {
        fontSize: 14,
        color: '#A19F9D',
        marginTop: 4,
    }
});

