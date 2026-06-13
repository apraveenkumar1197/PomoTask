import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Button, Modal, Portal, Surface, Text } from 'react-native-paper';

interface CustomDateTimePickerProps {
    value: Date;
    mode: 'date' | 'time' | 'datetime';
    display?: 'default' | 'spinner' | 'calendar' | 'clock';
    onChange: (event: any, date?: Date) => void;
    onClose: () => void;
}

const TEAMS_PURPLE = '#6264A7';

export default function CustomDateTimePicker({ value, mode, display = 'default', onChange, onClose }: CustomDateTimePickerProps) {
    if (Platform.OS !== 'web') {
        return (
            <DateTimePicker
                value={value}
                mode={mode as any}
                display={display as any}
                onChange={onChange}
            />
        );
    }

    // Web implementation
    const handleDayPress = (day: any) => {
        const newDate = new Date(value);
        newDate.setFullYear(day.year, day.month - 1, day.day);
        onChange({ type: 'set' }, newDate);
        onClose(); // Auto-close on any date selection as requested
    };

    const handleTimeChange = (e: any) => {
        const val = e.target.value;
        if (!val) return;
        const [h, min] = val.split(':').map(Number);
        const newDate = new Date(value);
        newDate.setHours(h, min);
        onChange({ type: 'set' }, newDate);
    };

    const formattedTime = () => {
        return value.toTimeString().split(' ')[0].substring(0, 5);
    };

    const formattedDate = () => {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, '0');
        const d = String(value.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    return (
        <Portal>
            <Modal
                visible={true}
                onDismiss={Platform.OS === 'web' ? undefined : onClose}
                dismissable={Platform.OS !== 'web'}
                contentContainerStyle={styles.webModal}
            >
                <Surface style={styles.webPickerContainer}>
                    <Text style={styles.title}>
                        Select {mode === 'datetime' ? 'Date & Time' : mode}
                    </Text>

                    {(mode === 'date' || mode === 'datetime') && (
                        <View style={styles.calendarContainer}>
                            <Calendar
                                current={formattedDate()}
                                onDayPress={handleDayPress}
                                markedDates={{
                                    [formattedDate()]: { selected: true, selectedColor: TEAMS_PURPLE }
                                }}
                                theme={{
                                    todayTextColor: TEAMS_PURPLE,
                                    arrowColor: TEAMS_PURPLE,
                                    selectedDayBackgroundColor: TEAMS_PURPLE,
                                }}
                            />
                        </View>
                    )}

                    {(mode === 'time' || mode === 'datetime') && (
                        <View style={styles.timeSection}>
                            <Text style={styles.label}>Time</Text>
                            <input
                                type="time"
                                value={formattedTime()}
                                onChange={handleTimeChange}
                                style={styles.htmlInput}
                            />
                        </View>
                    )}

                    <View style={styles.actions}>
                        <Button mode="contained" onPress={onClose} style={{ backgroundColor: TEAMS_PURPLE }}>
                            Done
                        </Button>
                    </View>
                </Surface>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    webModal: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    webPickerContainer: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'white',
        width: 350,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        textTransform: 'capitalize',
        textAlign: 'center',
    },
    calendarContainer: {
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#EDEBE9',
        borderRadius: 8,
        overflow: 'hidden',
    },
    timeSection: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#605E5C',
        marginBottom: 4,
    },
    htmlInput: {
        width: '100%',
        padding: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#EDEBE9',
        borderRadius: 4,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
});
