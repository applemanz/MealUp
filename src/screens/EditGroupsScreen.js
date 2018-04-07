import React from 'react';
import { View, Image, Text, StyleSheet, Button } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, ButtonGroup } from 'react-native-elements';
import firebase from "../config/firebase";
import HeaderButtons from 'react-navigation-header-buttons'
import Swiper from 'react-native-swiper';
import FriendList from '../components/FriendList';

// import { userName, userID } from '../screens/SignInScreen';

const userID = '10210889686788547'
const db = firebase.firestore();

export default class EditFriendsScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
      const params = navigation.state.params || {};
      return {
        title: 'Edit Friends',
        headerRight: (
          <HeaderButtons color = '#ffffff'>
            <HeaderButtons.Item title='Done' onPress={params.ButtonPressed} />
          </HeaderButtons>
        ),
        headerLeft: (
          <HeaderButtons color = '#ffffff'>
            <HeaderButtons.Item title='Cancel' onPress={params.ButtonPressed} />
          </HeaderButtons>
        ),
      };
    };

  state = {friends: []};

  componentWillMount() {
    this.props.navigation.setParams({ ButtonPressed: this.ButtonPressed});
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
        this.setState({friends:friends});
    });
  }

  ButtonPressed = () => {
    this.props.navigation.goBack(null)
  }

  render() {
    return (
      <View style={{flex:1}}>
        <FriendList data = {this.state.friends} navigation = {this.props.navigation} editOn = {true} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
  },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    color: '#000',
    fontSize: 30,
    fontWeight: 'bold',
  }
})
