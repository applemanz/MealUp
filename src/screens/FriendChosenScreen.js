import React from 'react';
import { View, Image, Text, TouchableHighlight } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {ListItem} from 'react-native-elements';
export default class FriendChosenScreen extends React.Component {

  render() {
    return (
      <View>
        <NavigationBar componentLeft={<View style={{flex: 1}}><TouchableHighlight onPress={() => this.props.navigation.goBack()}><Text style={{fontSize: 15, color: 'white'}}>Back</Text></TouchableHighlight></View>} componentCenter={<View style={{flex: 1}}><Text style={{fontSize: 14, color: 'white'}}>Choose a Time</Text></View>}/>
        <TouchableHighlight onPress={() => this.props.navigation.navigate('FinalRequest')}><ListItem title={"Time 1"}/></TouchableHighlight>
      <TouchableHighlight onPress={() => this.props.navigation.navigate('FinalRequest')}><ListItem title={"Time 2"}/></TouchableHighlight>
      </View>
    );
  }
}
