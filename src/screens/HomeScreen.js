import React from 'react';
import { View, SectionList, Text } from 'react-native';
import {ListItem} from 'react-native-elements';
import NavigationBar from 'navigationbar-react-native';
import Agenda from '../components/Agenda'
export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Meals'
  };

  onPressItem () {

  }

  render() {
    return (
      <View style={{flex: 1}}>
      <NavigationBar componentCenter={<Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>Meals</Text>}/>
        <Agenda/>
        </View>
    );
  }
}
