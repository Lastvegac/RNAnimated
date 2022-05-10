/* eslint-disable react-native/no-inline-styles */
import usePanResponder from './usePanResponder';
import React, {useRef} from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

const pointsDistance = ([xA, yA], [xB, yB]) => {
  return Math.sqrt(Math.pow(xA - xB, 2) + Math.pow(yA - yB, 2));
};

export default () => {
  const dimensions = useWindowDimensions();

  const pan = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [state, panHandlers] = usePanResponder();

  const {dragging, initialY, initialX, offsetY, offsetX} = state;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        const activeTouches = event.nativeEvent.changedTouches.length;
        if (activeTouches === 1) {
          pan.setValue({
            x: gestureState.dx,
            y: gestureState.dy,
          });
        } else if (activeTouches >= 2) {
          const touches = event.nativeEvent.changedTouches;

          const touchA = touches[0];
          const touchB = touches[1];

          const distance = pointsDistance(
            [touchA.pageX, touchA.pageY],
            [touchB.pageX, touchB.pageY],
          );

          const screenMovedPercents = distance / dimensions.width;

          scale.setValue(1 + screenMovedPercents * 3);
        }
      },
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(pan, {
            toValue: {
              x: 0,
              y: 0,
            },
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start();
      },
    }),
  ).current;

  const style = {
    backgroundColor: dragging ? '#2DC' : '#0BA',
    transform: [
      {translateX: initialX + offsetX},
      {translateY: initialY + offsetY},
    ],
  };

  return (
    <View style={styles.container}>
      <View
        // Put all panHandlers into the View's props
        {...panHandlers}
        style={[styles.square, style]}>
        <Text style={styles.text}>DRAG ME</Text>
      </View>
      <Animated.Image
        {...panResponder.panHandlers}
        source={require('../../assets/images/zoomable-image/avengers.jpg')}
        style={{
          height: 100,
          width: 100,
          borderRadius: 50,
          transform: [{translateX: pan.x}, {translateY: pan.y}, {scale}],
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  square: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 100,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
