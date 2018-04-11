import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActionSheetIOS,
  Alert,
  AlertIOS,
  Modal,
  Platform } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, Button, ButtonGroup, Icon } from 'react-native-elements';
import firebase from "../config/firebase";
import Swiper from 'react-native-swiper';
import { Ionicons } from '@expo/vector-icons';
import { userName, userID } from '../screens/SignInScreen';

const db = firebase.firestore();

class MyListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.name, this.props.members);
  };

  _onLongPress = () => {
    this.props.onLongPressItem(this.props.name, this.props.members, this.props.id, this.props.numOfMeals);
  };

  render() {
    var names = [];
    for (var memberID in this.props.members) {
      if (memberID != userID)
        names.push(this.props.members[memberID].split(" ")[0]);
    }
    names.sort()

    var memberStr = ""
    for (name of names) {
      memberStr = memberStr + name + ", "
    }
    memberStr = memberStr.slice(0, -2)

    urls = []
    for (memberID in this.props.members) {
      urls.push(`http://graph.facebook.com/${memberID}/picture?type=normal`)
    }
    urls.push(`http://graph.facebook.com/${userID}/picture?type=normal`)

    if (this.props.name == "") {
      title = memberStr
      memberStr = ""
    } else { title = this.props.name}

    return (
      <ListItem
        title={title}
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
        onLongPress = {this._onLongPress}
      />
    );
  }
}

export default class MultiSelectList extends React.PureComponent {
  state = {
     modalVisible: false,
   };

   setModalVisible(visible) {
     this.setState({modalVisible: visible});
     console.log('show modal')
   }


  _keyExtractor = (item, index) => item.id;

  _onPressItem = (name, members) => {
    this.props.navigation.navigate('FriendChosen', {
      groupname: name,
      members: members,
    });
  };

  _onLongPress = (name, members, id, numOfMeals) => {
    ActionSheetIOS.showActionSheetWithOptions({
    options: ['Cancel', 'Leave Group', 'Rename Group', 'Add Member'],
    destructiveButtonIndex: 1,
    cancelButtonIndex: 0,
  },
  (buttonIndex) => {
    if (buttonIndex === 1) {
      Alert.alert(
        'Leave Group?',
        "You won't be able to get meals with this group anymore.",
        [
          {text: 'Leave', onPress: () => this.leaveGroup(name, members, id, numOfMeals), style:'destructive'},
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        ],
        { cancelable: true }
      )}
    if (buttonIndex === 2) {

    if (Platform.OS === 'ios') {
      AlertIOS.prompt(
        'Enter new name for group',
        null,
        text => this.renameGroup(text)
      )
    } else {
      //android prompt
    }

    }
    if (buttonIndex === 3) {this.addMember()}
  });
  }

  leaveGroup = (name, members, id, numOfMeals) => {
    db.collection("users").doc(userID).collection("Groups").doc(id).delete().then(function() {
        console.log("Document successfully deleted!");
        delete members[userID]
        if (Object.keys(members).length < 3) {
          for (memberID in members) {
            db.collection("users").doc(memberID).collection("Groups").doc(id).delete()
          }
        } else {
          for (memberID in members) {
            // group name change
            db.collection("users").doc(memberID).collection("Groups").doc(id).set({
              groupName: name,
              members: members,
              numOfMeals: numOfMeals
            })
          }
        }
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
  }

  renameGroup = (text) => {
    console.log("You entered "+text)
  }

  addMember = () => {
    // TODO
  }

  _renderItem = ({item}) => (
    <MyListItem
      id={item.id}
      name={item.groupName}
      members = {item.members}
      onPressItem={this._onPressItem}
      onLongPressItem={this._onLongPress}
      numOfMeals={item.numOfMeals}
    />
  );

  addGroup = () => {
    this.props.navigation.navigate("AddGroup")
  }

  render() {
    console.log('group list data')
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
