import React from 'react';
import { StyleSheet, View } from 'react-native';

import * as THREE from 'three';
import * as WHS from 'whs';

import { WhitestormView } from '.';

console.ignoredYellowBox = ['THREE.WebGLRenderer'];

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <WhitestormView style={styles.scene} onAppCreate={this._handleAppCreate} />
      </View>
    );
  }

  _handleAppCreate = async app => {
    const bubbleComponent = new WHS.Sphere({
      geometry: {
        radius: 10,
        widthSegments: 32,
        heightSegments: 32,
      },

      // mass: 10,

      material: new THREE.MeshPhongMaterial({
        color: 0xffffff,
      }),

      position: new THREE.Vector3(0, 20, 0),
    });
    bubbleComponent.addTo(app);

    new WHS.AmbientLight({
      color: 0xffffff,
      intensity: 0.1,
    }).addTo(app);

    new WHS.DirectionalLight({
      color: 0xffffff,
      intensity: 0.3,

      position: [10, 20, 10],
    }).addTo(app);

    const light = new WHS.PointLight({
      color: 0xffffff,
      intensity: 0.7,
      distance: 200,

      position: [10, 20, 10],
      shadow: {
        fov: 90,
      },
    });
    light.addTo(app);

    new WHS.Box({
      geometry: {
        width: 100,
        height: 1,
        depth: 100,
      },

      position: new THREE.Vector3(0, -20, 0),

      modules: [
        // new PHYSICS.BoxModule({
        //   mass: 0
        // })
      ],

      material: new THREE.MeshPhongMaterial({ color: 0x447f8b }),
    }).addTo(app);

    app.start();

    requestAnimationFrame(this._renderNextFrame.bind(this, bubbleComponent));
  };

  _renderNextFrame(bubbleComponent, timestamp) {
    bubbleComponent.position.x = Math.sin(timestamp / 400) * 10;
    bubbleComponent.position.y = Math.cos(timestamp / 400) * 10;
    bubbleComponent.position.z = Math.sin(timestamp / 200) * 10;

    requestAnimationFrame(this._renderNextFrame.bind(this, bubbleComponent));
  }
}

window.addEventListener = (event, cb) => {
  console.log(`window.addEventListener(${event})`);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scene: {
    flex: 1,
  },
});
