import React from 'react';
import { View, Image, Text, TouchableHighlight, Avatar } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {Button} from 'react-native-elements';
import { StackNavigator } from 'react-navigation';
import FlatListSelector from '../components/FlatListSelector';

export default class FinalRequestScreen extends React.Component {

  render() {
  	const { params } = this.props.navigation.state;
  	const name = params ? params.name : null;
  	const friendID = params ? params.id : null;
  	const url = params ? params.url : null;
  	const time = params ? params.time : null;
  	const data = [
{key:0, location: 'Forbes'}, {key:1, location: 'Wucox'}, {key:2, location: 'Whitman'}, {key:3, location: 'Roma'}, {key:4, location: 'CJL'}]
    
    return (
      <View>
        <NavigationBar componentLeft={<View style={{flex: 1}}><TouchableHighlight onPress={() => this.props.navigation.goBack()}><Text style={{fontSize: 15, color: 'white'}}>Back</Text></TouchableHighlight></View>} componentCenter={<View style={{flex: 1}}><Text style={{fontSize: 20, color: 'white'}}>Meal Request</Text></View>}/>
	        <Text>name: {JSON.stringify(name)}</Text>
	        <Text>time: {JSON.stringify(time)}</Text>
	        <Button title="Submit" onPress={() => this.props.navigation.popToTop()}/>
      </View>
    );
  }
}
