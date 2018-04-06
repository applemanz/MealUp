import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { Button } from 'react-native-elements';
import firebase from "../config/firebase";
// import { userName, userID } from '../screens/SignInScreen';
require("firebase/firestore");
const db = firebase.firestore();
const userID = '10210889686788547'

class MyListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.id);
  };

  render() {
    const textColor = this.props.selected ? "gray" : "green";
    return (
      <Button onPress={this._onPress} title={this.props.title} backgroundColor={textColor}/>
    );
  }
}

export default class FlatListSelector extends React.PureComponent {
  userRef = db.collection('users').doc(userID).collection('Freetime').doc(this.props.dayOfWeek);

  constructor(props) {
    super(props);
    this.state = {selected: []}
    userRef = db.collection('users').doc(userID).collection('Freetime').doc(this.props.dayOfWeek);
    userRef.get().then(doc => {
      if (doc.exists) {
          console.log("Document data:", doc.data().Freetime);
          this.setState(previousState => {
        return { selected: doc.data().Freetime };
      });
      } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });
}



  updateState = (id) => {
    // copy the map rather than modifying state.
    const selected = this.state.selected.slice(0);
    selected[id] = !selected[id];
    // selected.set(id, !selected.get(id)); // toggle
    return {selected};
  };

  _onPressItem = (id: int) => {
    // updater functions are preferred for transactional updates
    this.setState(this.updateState(id), () => {
      console.log(this.state.selected);
      console.log(userID);
      var setWithMerge = this.userRef.set({
      Freetime: this.state.selected
      }, { merge: true });
    })
  }

  _renderItem = ({item}) => (
    // if (this.state.selected[index] == true)
    //   return <Button backgroundColor='green' onPress={this._onPressItem.bind(this, item.key)} title={item.time}/>
    // else
    //   return <Button onPress={this._onPressItem.bind(this, item.key)} title={item.time}/>
    <MyListItem
      id={item.key}
      onPressItem={this._onPressItem}
      selected={!this.state.selected[item.key]}
      title={item.time}
    />
  );

  render() {
    console.log(this.state.selected);
    return (

      <FlatList
        data={this.props.data}
        extraData={this.state}
        // keyExtractor={this._keyExtractor}
        renderItem={this._renderItem}
      />
    );
  }
}
