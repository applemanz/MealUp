import React from 'react';
import { View, Image } from 'react-native';

export default class FriendsScreen extends React.Component {
  static navigationOptions = {
    title: 'Friends',
  };

  render() {
    return (
      <View>
        <Image source={{uri: 'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/23376467_878179175674026_8006793075979759691_n.jpg?oh=8bb36dd52b356bdab134b120ea0bd2c3&oe=5B2AB9AA'}}
                style={{width:50, height: 50}} />
      </View>
    );
  }
}
