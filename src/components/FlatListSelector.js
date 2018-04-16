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
import { userName, userID } from '../screens/SignInScreen';
const db = firebase.firestore();

class MyListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.id);
  };

  render() {
    if (this.props.disable) {
      return null
    }
    if (this.props.selected === 2) {
      return (
        <Button disabled={true} title={'Meal'} disabledStyle={{backgroundColor:"#17bebb"}}/>
      )
    }
    if (this.props.selected === 1) {
      return (
        <Button onPress={this._onPress} title={this.props.title} backgroundColor="#37b737"/>
      )
    }
    return (
      <Button onPress={this._onPress} title={this.props.title} backgroundColor="#93929b"/>
    )

  }
}

export default class FlatListSelector extends React.PureComponent {
  userRef = db.collection('users').doc(userID).collection('Freetime').doc(this.props.dayOfWeek);

  constructor(props) {
    super(props);

    this.state = {selected: [], friends: {}}
  }

  componentDidMount() {
    this.userRef.onSnapshot((doc) => {
      if (doc.exists) {
        this.setState({selected: doc.data().Freetime})
      }
      else {
        console.log("No such document!");
      }
    })
    this.setState({timeIndex: this.getTimeIndex()})
    this.props.navigation.addListener('willFocus', ()=>{this.onRefresh()});
  }

  getTimeIndex() {
    d = new Date();
    month = d.getMonth();
    date = d.getDate();
    day = d.getDay();
    hour = d.getHours();
    min = d.getMinutes();
    i = (hour - 7) * 2 + Math.floor(min / 30) - 1;
    return i
  }

  onRefresh = () => {
    this.userRef.get().then((doc) => {
      if (doc.exists) {
        this.setState({selected: doc.data().Freetime})
      }
      else {
        console.log("No such document!");
      }
    })
  }

  updateState = (id) => {
    // copy the map rather than modifying state.
    selected = this.state.selected.slice(0);
    if (selected.length == 0) selected = Array.from(Array(25), () => 0);
    if (selected[id] === 0) {
      selected[id] = 1;
    } else if (selected[id] === 1) {
      selected[id] = 0;
    } else if (selected[id] === true) {
      selected[id] = 0;
    } else if (selected[id] === false) {
      selected[id] = 1;
    }
    // selected.set(id, !selected.get(id)); // toggle
    return {selected:selected};
  }

  _onPressItem = (id: int) => {
    this.setState(this.updateState(id), () => {
      // console.log(this.state.selected);
      // console.log(this.state.freeFriends);
      // console.log(this.state.friends)
      // console.log(userID);

      // merge
      var setWithMerge = this.userRef.set({
      Freetime: this.state.selected
      }, { merge: true });
    })
  }

  _renderItem = ({item}) => (
    <MyListItem
      id={item.key}
      onPressItem={this._onPressItem}
      selected={this.state.selected[item.key]}
      title={item.time}
      disable = {(this.props.curr && item.key < this.state.timeIndex) ? true : false}
    />
  );

  render() {
    //console.log(this.state.selected);
    // console.log(this.state.freeFriends);
    //console.log(this.state.friends)
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
// if (this.state.selected[index] == true)
//   return <Button backgroundColor='green' onPress={this._onPressItem.bind(this, item.key)} title={item.time}/>
// else
//   return <Button onPress={this._onPressItem.bind(this, item.key)} title={item.time}/>

      // for each friend updates newfreefriends
      // for (let friendID of Object.keys(this.state.friends)) {
      //   //console.log(friendID)
      //   let fdRef = db.collection("users").doc(friendID).collection('NewFreeFriends').doc(this.props.dayOfWeek)
      //   console.log(this.state.freeFriends[friendID])
      //   let newRef = "Freefriends" + "." + id + "." + userID
      //   let foo = new Object();
      //   console.log(newRef);
      //
      //   // if (!fdRef.exists)
      //   //   fdRef.set({Freefriends:{}})
      //   foo[newRef] = this.state.selected[id] === 1 ? true : false;
      //   fdRef.update(foo);
      // }
