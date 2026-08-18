import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const DEFAULT_ROW_HEIGHT = 90;
const LONG_PRESS_DURATION_MS = 350;

interface DraggableTaskListProps {
    data: any[];
    keyExtractor: (item: any) => string;
    renderItem: (params: { item: any; index: number; isActive: boolean }) => React.ReactNode;
    onDragEnd: (data: any[]) => void;
    ListEmptyComponent?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    refreshControl?: React.ReactElement<any>;
}

export default function DraggableTaskList({
    data,
    keyExtractor,
    renderItem,
    onDragEnd,
    ListEmptyComponent,
    style,
    contentContainerStyle,
    refreshControl,
}: DraggableTaskListProps) {
    const keys = data.map(keyExtractor);
    const heightsRef = useRef<Record<string, number>>({});
    const [, bumpVersion] = useState(0);

    const offsetsSV = useSharedValue<number[]>([]);
    const heightsSV = useSharedValue<number[]>([]);
    const draggingIndex = useSharedValue(-1);
    const targetIndex = useSharedValue(-1);
    const dragY = useSharedValue(0);

    useEffect(() => {
        const heights = keys.map((k) => heightsRef.current[k] ?? DEFAULT_ROW_HEIGHT);
        const offsets: number[] = [];
        let acc = 0;
        for (let i = 0; i < heights.length; i++) {
            offsets.push(acc);
            acc += heights[i];
        }
        offsets.push(acc);
        offsetsSV.value = offsets;
        heightsSV.value = heights;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keys.join(','), data.length]);

    const handleLayout = (key: string, e: LayoutChangeEvent) => {
        const h = Math.round(e.nativeEvent.layout.height);
        if (heightsRef.current[key] !== h) {
            heightsRef.current[key] = h;
            bumpVersion((n) => n + 1);
        }
    };

    const handleDragComplete = (from: number, to: number) => {
        if (from === -1 || to === -1 || from === to) return;
        const newData = [...data];
        const [moved] = newData.splice(from, 1);
        newData.splice(to, 0, moved);
        onDragEnd(newData);
    };

    return (
        <Animated.ScrollView style={style} contentContainerStyle={contentContainerStyle} refreshControl={refreshControl}>
            {data.length === 0
                ? ListEmptyComponent
                : data.map((item, index) => {
                    const key = keys[index];
                    return (
                        <DraggableRow
                            key={key}
                            index={index}
                            itemCount={data.length}
                            offsetsSV={offsetsSV}
                            heightsSV={heightsSV}
                            draggingIndex={draggingIndex}
                            targetIndex={targetIndex}
                            dragY={dragY}
                            onLayout={(e) => handleLayout(key, e)}
                            onDragComplete={handleDragComplete}
                        >
                            {(isActive: boolean) => renderItem({ item, index, isActive })}
                        </DraggableRow>
                    );
                })}
        </Animated.ScrollView>
    );
}

interface DraggableRowProps {
    index: number;
    itemCount: number;
    offsetsSV: SharedValue<number[]>;
    heightsSV: SharedValue<number[]>;
    draggingIndex: SharedValue<number>;
    targetIndex: SharedValue<number>;
    dragY: SharedValue<number>;
    onLayout: (e: LayoutChangeEvent) => void;
    onDragComplete: (from: number, to: number) => void;
    children: (isActive: boolean) => React.ReactNode;
}

function DraggableRow({
    index,
    itemCount,
    offsetsSV,
    heightsSV,
    draggingIndex,
    targetIndex,
    dragY,
    onLayout,
    onDragComplete,
    children,
}: DraggableRowProps) {
    const [isActiveJS, setIsActiveJS] = useState(false);

    const pan = Gesture.Pan()
        .activateAfterLongPress(LONG_PRESS_DURATION_MS)
        .onStart(() => {
            draggingIndex.value = index;
            targetIndex.value = index;
            dragY.value = 0;
            runOnJS(setIsActiveJS)(true);
        })
        .onUpdate((e) => {
            dragY.value = e.translationY;
            const offsets = offsetsSV.value;
            const heights = heightsSV.value;
            if (offsets.length <= index || heights.length <= index) return;

            const currentCenter = offsets[index] + e.translationY + heights[index] / 2;
            let newIndex = itemCount - 1;
            for (let i = 0; i < itemCount; i++) {
                if (currentCenter < offsets[i + 1]) {
                    newIndex = i;
                    break;
                }
            }
            if (newIndex < 0) newIndex = 0;
            targetIndex.value = newIndex;
        })
        .onEnd(() => {
            const from = draggingIndex.value;
            const to = targetIndex.value;
            dragY.value = 0;
            draggingIndex.value = -1;
            targetIndex.value = -1;
            runOnJS(setIsActiveJS)(false);
            runOnJS(onDragComplete)(from, to);
        });

    const animatedStyle = useAnimatedStyle(() => {
        const dragging = draggingIndex.value;
        if (dragging === -1) {
            return { transform: [{ translateY: 0 }], zIndex: 0, elevation: 0 };
        }
        if (dragging === index) {
            return { transform: [{ translateY: dragY.value }], zIndex: 999, elevation: 8 };
        }

        const heights = heightsSV.value;
        const activeHeight = heights[dragging] ?? 0;
        const tgt = targetIndex.value;
        let shift = 0;
        if (tgt < dragging) {
            if (index >= tgt && index < dragging) shift = activeHeight;
        } else if (tgt > dragging) {
            if (index > dragging && index <= tgt) shift = -activeHeight;
        }
        return {
            transform: [{ translateY: withSpring(shift, { damping: 20, stiffness: 200 }) }],
            zIndex: 0,
            elevation: 0,
        };
    });

    return (
        <GestureDetector gesture={pan}>
            <Animated.View onLayout={onLayout} style={animatedStyle}>
                {children(isActiveJS)}
            </Animated.View>
        </GestureDetector>
    );
}
