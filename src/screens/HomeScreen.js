import React from 'react';
import { View, SectionList, Text } from 'react-native';
import {ListItem} from 'react-native-elements';
import NavigationBar from 'navigationbar-react-native';
import Agenda from '../components/Agenda'
export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Meals'
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <Agenda/>
      </View>
    );
  }
}
