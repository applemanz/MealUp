import React from 'react';
import { View, Image, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, Button, ButtonGroup, Icon, CheckBox } from 'react-native-elements';
import firebase from "../config/firebase";
import Swiper from 'react-native-swiper';
import { Ionicons } from '@expo/vector-icons';
import { userName, userID } from '../screens/SignInScreen';

const db = firebase.firestore();

class MyListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.name, this.props.id, this.props.url, this.props.CanViewFriend);
  };
  onSelect = () => {
    this.props.onSelect(this.props.id)
  }

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
    }
    else if (this.props.addGroup) {
      return (
        <ListItem
          roundAvatar
          title={this.props.name}
          avatar={{ uri: this.props.url}}
          onPress = {this.onSelect}
          rightIcon = {
            <Icon
              name={this.props.selected ? 'ios-checkmark-circle' : 'ios-radio-button-off'}
              iconStyle = {{padding:5}}
              type = 'ionicon'
              color='#f4511e'
              size = {30}
              underlayColor = 'transparent'
              onPress = {this.onSelect}
            />
          }
        />
      );
    }
    else if(this.props.addMember) {
      if (!(this.props.id in this.props.currentMembers)) {
        return (
          <ListItem
            roundAvatar
            title={this.props.name}
            avatar={{ uri: this.props.url}}
            onPress = {this.onSelect}
            rightIcon = {
              <Icon
                name={this.props.selected ? 'ios-checkmark-circle' : 'ios-radio-button-off'}
                iconStyle = {{padding:5}}
                type = 'ionicon'
                color='#f4511e'
                size = {30}
                underlayColor = 'transparent'
                onPress = {this.onSelect}
              />
            }
          />
        )
      } else {return null}
    }
    else {
      return (
        <ListItem
          roundAvatar
          title={this.props.name}
          avatar={{ uri: this.props.url}}
          onPress = {this._onPress}
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

export default class FriendList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {selected: new Map()}
  }

  componentDidMount() {
    if (this.props.currentMembers) {
      console.log("data")
      console.log(this.props.data)

      var selected = new Map()
      for (item of this.props.data) {
        if (item.id in this.props.currentMembers)
          selected.set(item.id, true)
      }
      this.setState({selected:selected})
      console.log("current members")
      console.log(this.state.selected)
    }
  }

  _keyExtractor = (item, index) => item.id;

  _onPressItem = (name, id, url, bool) => {
    this.props.navigation.navigate('FriendChosen', {
      name: name,
      id: id,
      url:url,
      CanViewFriend: bool
    });
  };

  onSelect = (id) => {
    this.setState((state) => {
      // copy the map rather than modifying state.
      const selected = new Map(state.selected);
      selected.set(id, !selected.get(id)); // toggle
      return {selected};
    });
    console.log(this.state.selected)
  }

  _renderItem = ({item}) => (
    <MyListItem
      id={item.id}
      onPressItem={this._onPressItem}
      onSelect={this.onSelect}
      selected={!!this.state.selected.get(item.id)}
      name={item.Name}
      url = {item.url}
      CanViewMe = {item.CanViewMe}
      CanViewFriend = {item.CanViewFriend}
      editOn = {this.props.editOn}
      addGroup = {this.props.addGroup}
      addMember = {this.props.addMember}
      currentMembers = {this.props.currentMembers}
    />
  );

  render() {
    return (
      <View style={{flex:1}}>
        <FlatList
          data={this.props.data}
          extraData={this.state}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
        />
        {this.renderBottom()}
      </View>
    )
  }

  // Add Group Screen Friend List Code
  countSelected = () => {
    count = 0
    if (this.state.selected) {
    for (var [key, value] of this.state.selected) {
      if (value) count += 1
    }
  }
    return count
  }

  createGroup = () => {
    if (this.countSelected() == 1) return;
    data = new Object()
    members = new Object()
    for (var [key, value] of this.state.selected) {
      if (value) {
        members[key] = this.props.data.find(item => item.id === key).Name
      }
    }
    members[userID] = userName
    var groupName = this.props.groupName
    data['groupName'] = groupName
    data['members'] = members
    data['numOfMeals'] = 0

    db.collection("users").doc(userID).collection('Groups').add(data)
        .then((docRef) => {
            console.log("Document written successfully");
            for (id in members) {
              if (id != userID) {
                db.collection("users").doc(id).collection('Groups').doc(docRef.id).set(data)
              }
            }
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    this.props.navigation.goBack();
  }

  addMember = (groupID) => {
    if (this.countSelected() == 2) return;
    var data = new Object()
    var members = new Object()
    for (var [key, value] of this.state.selected) {
      if (value) {
        members[key] = this.props.data.find(item => item.id === key).Name
      }
    }
    members[userID] = userName
    var groupName = this.props.groupName
    data['members'] = members

    db.collection("users").doc(userID).collection('Groups').doc(groupID).set(data,{merge:true})
        .then((docRef) => {
            console.log("Document written successfully");
            for (id in members) {
              if (id != userID) {
                db.collection("users").doc(id).collection('Groups').doc(groupID).set(data,{merge:true})
              }
            }
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    this.props.navigation.goBack();
  }

  renderBottom = () => {
    if (this.props.addGroup || this.props.addMember) {
      if (this.props.addGroup && this.countSelected() >= 1) {
        buttonActive = this.countSelected() >= 2 ? '#f4511e' : '#d3d3d3'
        buttonFont = this.countSelected() >= 2 ? 'bold' : 'normal'
        return (
          <View >
            <ListItem
              title={''}
              rightIcon = {
                <TouchableOpacity
                  style={{backgroundColor: 'transparent',}}
                  onPress={this.createGroup}>
                  <Text style = {{color:buttonActive, fontWeight: 'bold'}}>Create Group</Text>
                </TouchableOpacity>}
              leftIcon = {
                <View style={{flex: 4, flexDirection: 'row',}}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator = {false}
                    // contentContainerStyle={{justifyContent:''}}
                    >
                  {this.renderAvatars()}
                  </ScrollView>
                </View>
              }
            />
          </View>
        )
      }
      console.log(this.countSelected())
      console.log(Object.keys(this.props.currentMembers).length)
      if (this.props.addMember) {
        buttonActive = this.countSelected()-Object.keys(this.props.currentMembers).length >= 0 ? '#f4511e' : '#d3d3d3'
        buttonFont = this.countSelected()-Object.keys(this.props.currentMembers).length >= 0 ? 'bold' : 'normal'
      return (
        <View >
          <ListItem
            title={''}
            rightIcon = {
              <TouchableOpacity
                style={{backgroundColor: 'transparent',}}
                onPress={() => this.addMember(this.props.groupID)}>
                <Text style = {{color:buttonActive, fontWeight: 'bold'}}>Add Member(s)</Text>
              </TouchableOpacity>}
            leftIcon = {
              <View style={{flex: 4, flexDirection: 'row',}}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator = {false}
                  // contentContainerStyle={{justifyContent:''}}
                  >
                {this.renderAvatars()}
                </ScrollView>
              </View>
            }
          />
        </View>
      )
    }
    }
  }

  renderAvatars = () => {
    selectedURLs = []
    for (var [key, value] of this.state.selected) {
      if (value) {
        selectedURLs.push(`http://graph.facebook.com/${key}/picture?type=small`)
      }
    }
    return (
      selectedURLs.map((url)=> {
        return <Avatar
            small
            rounded
            key = {url}
            source={{uri: url}}
            containerStyle = {{margin:5}}
            // activeOpacity={0.7}
          />
      })
    )
  }

}
