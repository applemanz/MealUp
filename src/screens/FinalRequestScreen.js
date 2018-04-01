import React from 'react';
import { View, Image, Text, TouchableHighlight } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {Button} from 'react-native-elements';
export default class FinalRequestScreen extends React.Component {

  render() {
    return (
      <View>
        <NavigationBar componentLeft={<View style={{flex: 1}}><TouchableHighlight onPress={() => this.props.navigation.goBack()}><Text style={{fontSize: 15, color: 'white'}}>Back</Text></TouchableHighlight></View>} componentCenter={<View style={{flex: 1}}><Text style={{fontSize: 20, color: 'white'}}>Meal Request</Text></View>}/>
        <Button title="Submit" onPress={() => this.props.navigation.popToTop()}/>
      </View>
    );
  }
}
