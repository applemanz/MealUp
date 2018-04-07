import React from 'react';
import { View, Image, Text, TouchableHighlight } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, Button } from 'react-native-elements';
import firebase from "../config/firebase";
import { userName } from '../screens/SignInScreen';

const userID = '10210889686788547'
const db = firebase.firestore();

export default class RequestByFriendScreen extends React.Component {

  state = {friends: []};

  componentDidMount() {
    queryFriends = {};
    db.collection("users").doc(userID).collection('Friends')
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            queryFriends[doc.id] = {Name: doc.data().Name, url:`http://graph.facebook.com/${doc.id}/picture?type=square`, id: doc.id}
          });
        this.setState({friends:queryFriends});
      });
  }


  _onPress = (name, id, url) => {
    this.props.navigation.navigate('FriendChosen', {
      name: name,
      id: id,
      url:url
    });
  }


render() {
  friendItems = []
  for (friendID in this.state.friends) {
    friend = this.state.friends[friendID]
    friendItems.push(
      <ListItem
        key={friend.id}
        roundAvatar
        title={friend.Name}
        avatar={{uri:friend.url}}
        onPress={() => this._onPress(friend.Name,friend.id, friend.url)}
      />
    );
  }
    return (
      <View>
        <NavigationBar componentLeft={<View style={{flex: 1}}><TouchableHighlight underlayColor='transparent' style={{padding: 20}} onPress={() => this.props.navigation.goBack()}><Text style={{fontSize: 15, color: 'white'}}>Back</Text></TouchableHighlight></View>} componentCenter={<View style={{flex: 1}}><Text style={{fontSize: 14, color: 'white'}}>Request By Friend</Text></View>}/>
        <Card containerStyle={{padding: 0}}> {friendItems} </Card>
      </View>
    );
  }
}
