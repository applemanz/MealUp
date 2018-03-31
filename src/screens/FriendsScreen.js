import React from 'react';
import { View, Image, Text } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
export default class FriendsScreen extends React.Component {
  static navigationOptions = {
    title: 'Friends',
  };

  render() {
    return (
      <View>
        <NavigationBar componentCenter={<Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>Friends</Text>}/>
        <Image source={{uri: 'https://graph.facebook.com/2042768522715597/picture?type=square'}}
                style={{width:50, height: 50}} />
      </View>
    );
  }
}
