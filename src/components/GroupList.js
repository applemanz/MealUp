import React from 'react';
import { View, Image, Text, StyleSheet, FlatList, TouchableOpacity, ActionSheetIOS } from 'react-native';
import { ActionSheetProvider, connectActionSheet } from '@expo/react-native-action-sheet';
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
      if (memberID != userID)
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
        // onLongPress = {this._onLongPress}
      />
    );
  }

  // _onLongPress = () => {
  //   this.props.onLongPressItem(this.props.name, this.props.Members);
  // };

  // _onOpenActionSheet = () => {
  //   // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
  //   let options = ['Delete', 'Save', 'Cancel'];
  //   let destructiveButtonIndex = 0;
  //   let cancelButtonIndex = 2;
  //
  //   this.props.showActionSheetWithOptions({
  //     options,
  //     cancelButtonIndex,
  //     destructiveButtonIndex,
  //   },
  //   (buttonIndex) => {
  //     // Do something here depending on the button index selected
  //   });
  //
  // }
  // onLongPress = () => {
  //   ActionSheetIOS.showActionSheetWithOptions({
  //   options: ['Cancel', 'Remove'],
  //   destructiveButtonIndex: 1,
  //   cancelButtonIndex: 0,
  // },
  // (buttonIndex) => {
  //   if (buttonIndex === 1) { /* destructive action */ }
  // });
  // }

}

export default class MultiSelectList extends React.PureComponent {
  state = {selected: (new Map(): Map<string, boolean>)};

  _keyExtractor = (item, index) => item.id;

  _onPressItem = (name, members) => {
    // this.props.navigation.navigate('FriendChosen', {
    //   name: name,
    //   members: members,
    // });
  };

  _onLongPress = (name, members) => {
    ActionSheetIOS.showActionSheetWithOptions({
    options: ['Cancel', 'Remove'],
    destructiveButtonIndex: 1,
    cancelButtonIndex: 0,
  },
  (buttonIndex) => {
    if (buttonIndex === 1) { /* destructive action */ }
  });
  }

  _renderItem = ({item}) => (
    <MyListItem
      id={item.id}
      onPressItem={this._onPressItem}
      name={item.Name}
      Members = {item.Members}
      onLongPressItem={this._onLongPress}
    />
  );

  addGroup = () => {
    this.props.navigation.navigate("AddGroup")
  }

  render() {
    console.log(this.props.data)
    return (
      <View style={{flex:1}}>
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
