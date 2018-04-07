import React from 'react';
import { View, Image, Text, TouchableHighlight } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {ListItem} from 'react-native-elements';
export default class RequestByTimeScreen extends React.Component {

  render() {
    return (
      <View>
        <NavigationBar componentLeft={<View style={{flex: 1}}><TouchableHighlight underlayColor='transparent' style={{padding: 20}} onPress={() => this.props.navigation.goBack()}><Text style={{fontSize: 15, color: 'white'}}>Back</Text></TouchableHighlight></View>} componentCenter={<View style={{flex: 1}}><Text style={{fontSize: 16, color: 'white'}}>Request By Time</Text></View>}/>
        <TouchableHighlight onPress={() => this.props.navigation.navigate('TimeChosen')}><ListItem title={"Time 1"}/></TouchableHighlight>
      <TouchableHighlight onPress={() => this.props.navigation.navigate('TimeChosen')}><ListItem title={"Time 2"}/></TouchableHighlight>
      </View>
    );
  }
}
