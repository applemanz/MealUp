import React from 'react';
import { View, Image, Text, TouchableHighlight } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
export default class FinalRequestScreen extends React.Component {

  render() {
    return (
      <View>
        <NavigationBar componentLeft={<View style={{flex: 1}}><TouchableHighlight onPress={() => this.props.navigation.goBack()}><Text style={{fontSize: 15, color: 'white'}}>Back</Text></TouchableHighlight></View>} componentCenter={<View style={{flex: 1}}><Text style={{fontSize: 20, color: 'white'}}>Meal Request</Text></View>}/>
        <Image source={{uri: 'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/23376467_878179175674026_8006793075979759691_n.jpg?oh=8bb36dd52b356bdab134b120ea0bd2c3&oe=5B2AB9AA'}}
                style={{width:50, height: 50}} />
      </View>
    );
  }
}
