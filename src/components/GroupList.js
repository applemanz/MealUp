import React from 'react';
import { View, Image, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, Button, ButtonGroup, Icon } from 'react-native-elements';
import firebase from "../config/firebase";
import Swiper from 'react-native-swiper';
import { Ionicons } from '@expo/vector-icons';
import { userName, userID } from '../screens/SignInScreen';

const db = firebase.firestore();

class MyListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.name, this.props.Members);
  };

  render() {
    var memberStr = ""
    urls = []
    var names = [];
    for (var memberID in this.props.Members) {
    names.push(this.props.Members[memberID]);
    }
    names.sort()
    for (memberID in this.props.Members) {
      urls.push(`http://graph.facebook.com/${memberID}/picture?type=normal`)
      // memberStr = memberStr + this.props.Members[memberID].split(" ")[0] + ", "
    }
    for (name of names) {
      memberStr = memberStr + name.split(" ")[0] + ", "
    }
    urls.push(`http://graph.facebook.com/${userID}/picture?type=normal`)
    memberStr = memberStr.slice(0, -2)
    return (
      <ListItem
        title={this.props.name}
        subtitle = {memberStr}
        leftIcon = {
          <View style={{flexDirection:'row', overflow: 'hidden', paddingRight:10}} >
              <View style={{overflow: 'hidden', borderTopLeftRadius: 25, borderBottomLeftRadius: 25}}>
                <Image
                  style={{width: 25, height: 50,}}
                  source={{uri:urls[0]}} />
              </View>
              <View style ={{overflow: 'hidden', borderTopRightRadius: 25, borderBottomRightRadius: 25}}>
                <Image
                  style={{width: 25, height: 25, }}
                  source={{uri:urls[1]}} />
                <Image
                  style={{width: 25, height: 25, }}
                  source={{uri:urls[2]}}/>
              </View>
            </View>}
        onPress = {this._onPress}
      />
    );
  }

}

export default class MultiSelectList extends React.PureComponent {
  state = {selected: (new Map(): Map<string, boolean>)};

  _keyExtractor = (item, index) => item.id;

  _onPressItem = (name, members) => {
    this.props.navigation.navigate('FriendChosen', {
      name: name,
      members: members,
    });
  };

  _renderItem = ({item}) => (
    <MyListItem
      id={item.id}
      onPressItem={this._onPressItem}
      name={item.Name}
      Members = {item.Members}
    />
  );

  addGroup = () => {

  }

  render() {
    console.log(this.props.data)
    return (
      <View>
        <ListItem
          title={'Add Group'}
          titleStyle = {{paddingLeft:10}}
          leftIcon = {<Icon
            name={'ios-people'}
            type = 'ionicon'
            color='#000'
          />}
          hideChevron
          onPress = {this.addGroup}
        />
        <FlatList
          data={this.props.data}
          extraData={this.state}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
        />
      </View>
    );
  }
}
