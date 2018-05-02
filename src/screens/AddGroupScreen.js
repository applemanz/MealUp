import React from 'react';
import { View, Image, Text, StyleSheet, Button, TextInput } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, ButtonGroup, CheckBox, Divider } from 'react-native-elements';
import firebase from "../config/firebase";
import HeaderButtons from 'react-navigation-header-buttons'
import Swiper from 'react-native-swiper';
import FriendList from '../components/FriendList';
import { userName, userID } from '../screens/SignInScreen';

const db = firebase.firestore();

export default class AddGroupScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
      const params = navigation.state.params || {};
      return {
        title: 'New Group',
        headerLeft: (
          <HeaderButtons color = '#ffffff'>
            <HeaderButtons.Item title='Cancel' onPress={params.CancelButtonPressed} />
          </HeaderButtons>
        ),
      };
    };

  state = {friends: [], groupName: ""};

  componentWillMount() {
    this.props.navigation.setParams({CancelButtonPressed: this.CancelButtonPressed});
  }

  componentDidMount() {
    db.collection("users").doc(userID).collection('Friends').onSnapshot((querySnapshot) => {
        friends = [];
        querySnapshot.forEach(function(doc) {
            friends.push({
              Name: doc.data().Name,
              url:`http://graph.facebook.com/${doc.id}/picture?type=normal`,
              id: doc.id,
              CanViewMe: doc.data().CanViewMe,
              CanViewFriend: doc.data().CanViewFriend,
              numOfMeals: doc.data().numOfMeals
            })
        });
        friends.sort();
        this.setState({friends:friends});
    });
  }

  CancelButtonPressed = () => {
    this.props.navigation.goBack(null)
  }

  render() {
    return (
      <View style={{flex:1}}>
        <TextInput
          underlineColorAndroid = 'transparent'
          placeholder = {'Name this group (optional)'}
          onChangeText = {(text) => {this.setState({groupName:text})}}
          style={{height: 30, fontSize: 20, color: 'black', marginTop:20, marginBottom:20, marginLeft:20}}
        />
        <Divider style={{ backgroundColor: '#f4511e', height: 3 }} />
        <FriendList data = {this.state.friends} navigation = {this.props.navigation} addGroup = {true} groupName = {this.state.groupName}/>
      </View>
    );
  }
}
