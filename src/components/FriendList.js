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
    this.props.onPressItem(this.props.name, this.props.id, this.props.url, this.props.CanViewFriend);
  };

  render() {
    if (this.props.editOn) {
      return (
        <ListItem
          roundAvatar
          title={this.props.name}
          avatar={{ uri: this.props.url}}
          rightIcon = {
            <Icon
              name={this.props.CanViewMe ? 'md-eye' : 'md-eye-off'}
              iconStyle = {{padding:10}}
              type = 'ionicon'
              color='#000'
              onPress = {() => {this.changeViewPermissions(this.props.id, !this.props.CanViewMe)}}
            />
          }
        />
      );
    } else {
    return (
      <ListItem
        roundAvatar
        title={this.props.name}
        avatar={{ uri: this.props.url}}
        onPress = {this.props.editOn ? ()=>{} : this._onPress}
        // switchButton
        // badge={{ value: 3, textStyle: { color: 'white' }, containerStyle: { marginTop: 0, marginRight: 10 } }}
        rightIcon = {{name: 'chevron-right'}}
      />
    );
  }
  }

  changeViewPermissions = (id, bool) => {
    db.collection('users').doc(userID).collection('Friends').doc(id).set({
      CanViewMe: bool
    }, {merge:true})
    db.collection('users').doc(id).collection('Friends').doc(userID).set({
      CanViewFriend: bool
    }, {merge:true})
  }
}

export default class MultiSelectList extends React.PureComponent {
  state = {selected: (new Map(): Map<string, boolean>)};

  _keyExtractor = (item, index) => item.id;

  _onPressItem = (name, id, url, bool) => {
    this.props.navigation.navigate('FriendChosen', {
      name: name,
      id: id,
      url:url,
      CanViewFriend: bool
    });
  };

  _renderItem = ({item}) => (
    <MyListItem
      id={item.id}
      onPressItem={this._onPressItem}
      selected={!!this.state.selected.get(item.id)}
      name={item.Name}
      url = {item.url}
      CanViewMe = {item.CanViewMe}
      CanViewFriend = {item.CanViewFriend}
      editOn = {this.props.editOn}
    />
  );

  render() {
    return (
      <FlatList
        data={this.props.data}
        extraData={this.state}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem}
      />
    );
  }
}
