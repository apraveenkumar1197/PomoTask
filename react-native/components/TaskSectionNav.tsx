import { CalendarDays, History, Home, Star, Sun, Tag, X } from 'lucide-react-native';
import React from 'react';
import {
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { Divider, Text } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { BRAND, NEUTRAL, RADIUS } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web' && SCREEN_WIDTH > 768;

type FilterValue = string | null;

interface Section {
    label: string;
    value: FilterValue;
    icon: React.ComponentType<any>;
}

const SECTIONS: Section[] = [
    { label: 'My Day', value: 'my_day', icon: Sun },
    { label: 'Important', value: 'important', icon: Star },
    { label: 'Planned', value: 'planned', icon: CalendarDays },
    { label: 'Tasks', value: null, icon: Home },
    { label: 'History', value: 'task-history', icon: History },
];

interface Props {
    activeFilter: FilterValue;
    onFilterChange: (filter: FilterValue) => void;
    homePageTags?: Array<{ id: string; name: string; home_page_order: number }>;
    onRemoveHomePageTag?: (tagName: string) => void;
}

function AnimatedNavChip({ isActive, onPress, children }: { isActive: boolean; onPress: () => void; children: React.ReactNode }) {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    return (
        <Animated.View style={animStyle}>
            <Pressable
                onPress={onPress}
                onPressIn={() => { scale.value = withSpring(0.94, { damping: 15, stiffness: 300 }); }}
                onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
                style={[styles.chip, isActive && styles.chipActive]}
            >
                {children}
            </Pressable>
        </Animated.View>
    );
}

export default function TaskSectionNav({ activeFilter, onFilterChange, homePageTags = [], onRemoveHomePageTag }: Props) {
    if (IS_WEB) {
        return (
            <View style={styles.sidebar}>
                {SECTIONS.map((section) => {
                    const isActive = activeFilter === section.value;
                    const IconComp = section.icon;
                    return (
                        <React.Fragment key={section.label}>
                            {section.label === 'History' && (
                                <Divider style={styles.sidebarDivider} />
                            )}
                            <Pressable
                                onPress={() => onFilterChange(section.value)}
                                style={[
                                    styles.sidebarItem,
                                    isActive && styles.sidebarItemActive,
                                ]}
                            >
                                {isActive && <View style={styles.sidebarActiveBar} />}
                                <IconComp
                                    size={18}
                                    color={isActive ? BRAND.primary : NEUTRAL[500]}
                                    style={{ marginRight: 12 }}
                                />
                                <Text
                                    style={[
                                        styles.sidebarLabel,
                                        isActive && styles.sidebarLabelActive,
                                    ]}
                                >
                                    {section.label}
                                </Text>
                            </Pressable>
                        </React.Fragment>
                    );
                })}

                {homePageTags.length > 0 && <Divider style={styles.sidebarDivider} />}
                {homePageTags.map((tag) => {
                    const tagValue = `tag:${tag.name}`;
                    const isActive = activeFilter === tagValue;
                    return (
                        <Pressable
                            key={tag.id}
                            onPress={() => onFilterChange(tagValue)}
                            style={[
                                styles.sidebarItem,
                                isActive && styles.sidebarItemActive,
                            ]}
                        >
                            {isActive && <View style={styles.sidebarActiveBar} />}
                            <Tag
                                size={18}
                                color={isActive ? BRAND.primary : NEUTRAL[500]}
                                style={{ marginRight: 12 }}
                            />
                            <Text
                                style={[
                                    styles.sidebarLabel,
                                    isActive && styles.sidebarLabelActive,
                                    { flex: 1 },
                                ]}
                            >
                                {tag.name}
                            </Text>
                            {onRemoveHomePageTag && (
                                <Pressable
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        onRemoveHomePageTag(tag.name);
                                    }}
                                    style={styles.removeBtn}
                                >
                                    <X size={14} color={NEUTRAL[500]} />
                                </Pressable>
                            )}
                        </Pressable>
                    );
                })}
            </View>
        );
    }

    // Mobile: Horizontal scrollable animated chips
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipContainer}
            style={styles.chipScroll}
        >
            {SECTIONS.map((section) => {
                const isActive = activeFilter === section.value;
                const IconComp = section.icon;
                return (
                    <AnimatedNavChip
                        key={section.label}
                        isActive={isActive}
                        onPress={() => onFilterChange(section.value)}
                    >
                        <IconComp
                            size={15}
                            color={isActive ? '#fff' : NEUTRAL[500]}
                            style={{ marginRight: 5 }}
                        />
                        <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                            {section.label}
                        </Text>
                    </AnimatedNavChip>
                );
            })}

            {homePageTags.map((tag) => {
                const tagValue = `tag:${tag.name}`;
                const isActive = activeFilter === tagValue;
                return (
                    <AnimatedNavChip
                        key={tag.id}
                        isActive={isActive}
                        onPress={() => onFilterChange(tagValue)}
                    >
                        <Tag
                            size={15}
                            color={isActive ? '#fff' : NEUTRAL[500]}
                            style={{ marginRight: 5 }}
                        />
                        <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                            {tag.name}
                        </Text>
                        {onRemoveHomePageTag && (
                            <Pressable
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onRemoveHomePageTag(tag.name);
                                }}
                                style={styles.chipRemoveBtn}
                            >
                                <X size={12} color={isActive ? '#fff' : NEUTRAL[500]} />
                            </Pressable>
                        )}
                    </AnimatedNavChip>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    sidebar: {
        width: 200,
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: '#FAFAFE',
        ...Platform.select({
            web: { borderRightWidth: 1, borderRightColor: '#E5E7EB' } as any,
            default: {},
        }),
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: RADIUS.sm + 2,
        marginBottom: 2,
        position: 'relative',
        overflow: 'hidden',
    },
    sidebarItemActive: {
        backgroundColor: BRAND.primaryLight,
    },
    sidebarActiveBar: {
        position: 'absolute',
        left: 0,
        top: 6,
        bottom: 6,
        width: 3,
        borderRadius: 2,
        backgroundColor: BRAND.primary,
    },
    sidebarLabel: {
        fontSize: 14,
        color: NEUTRAL[500],
        fontWeight: '500',
    },
    sidebarLabelActive: {
        color: BRAND.primary,
        fontWeight: '600',
    },
    sidebarDivider: {
        marginVertical: 8,
        backgroundColor: '#E5E7EB',
    },

    chipScroll: {
        flexGrow: 0,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 4,
    },
    chipContainer: {
        gap: 8,
        paddingRight: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.pill,
        backgroundColor: '#F0F0F8',
        borderWidth: 1,
        borderColor: '#E0E0F0',
    },
    chipActive: {
        backgroundColor: BRAND.primary,
        borderColor: BRAND.primary,
    },
    chipLabel: {
        fontSize: 13,
        color: NEUTRAL[500],
        fontWeight: '500',
    },
    chipLabelActive: {
        color: '#fff',
        fontWeight: '600',
    },
    removeBtn: {
        marginLeft: 'auto',
        padding: 4,
        borderRadius: 4,
    },
    chipRemoveBtn: {
        marginLeft: 6,
        padding: 2,
    },
});
