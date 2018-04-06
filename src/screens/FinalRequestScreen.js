import React from 'react';
import { View, Image, Text, TouchableHighlight, FlatList } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {Button} from 'react-native-elements';

const data = [
{id:0, title: 'Wucox'}, {id:1, title: 'Whitman'}, {id:2, title: 'RoMa'}, {id:3, title: 'Forbes'}, {id:4, title: 'CJL'},
{id:5, title: 'Graduate College'}, {id:6, title: 'Frist Late Meal'}]

export default class FinalRequestScreen extends React.Component {

  render() {
    return (
      <View>
        <NavigationBar componentLeft={<View style={{flex: 1}}><TouchableHighlight onPress={() => this.props.navigation.goBack()}><Text style={{fontSize: 15, color: 'white'}}>Back</Text></TouchableHighlight></View>} componentCenter={<View style={{flex: 1}}><Text style={{fontSize: 20, color: 'white'}}>Meal Request</Text></View>}/>
      </View>
    );
  }
}
