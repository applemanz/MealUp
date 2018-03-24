import React from 'react';
import { View, Button} from 'react-native';

export default class RequestsScreen extends React.Component {
  static navigationOptions = {
    title: 'Requests',
  };

  RequestByFriend () {

  }

  RequestByTime () {

  }

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <View style={{padding: 15}}>
          <Button onPress={this.RequestByFriend} title="Request by Friend"/>
        </View>
        <View style={{padding: 15}}>
          <Button onPress = {this.RequestByTime} title="Request by Time"/>
        </View>
      </View>
    );
  }
}
