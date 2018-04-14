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
    // const textColor = this.props.selected ? "gray" : "green";
    if (this.props.selected === 2) {
      return (
      <Button onPress={this._onPress} title={this.props.title} backgroundColor="black"/>
    );} else if (this.props.selected === 1) {
      return (
        <Button onPress={this._onPress} title={this.props.title} backgroundColor="green"/>
    );} else {
      return (
        <Button onPress={this._onPress} title={this.props.title} backgroundColor="gray"/>
    );}
  }
}

export default class FlatListSelector extends React.PureComponent {
  userRef = db.collection('users').doc(userID).collection('Freetime').doc(this.props.dayOfWeek);

  constructor(props) {
    super(props);
    this.state = {selected: [], friends: {}, freeFriends: {}}
  }

  componentDidMount() {
    userRef = db.collection('users').doc(userID).collection('Freetime').doc(this.props.dayOfWeek);
    userRef.onSnapshot((doc) => {
      if (doc.exists) {
        this.setState({selected: doc.data().Freetime})
      }
      else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    })
    // .catch(function(error) {
    //   console.log("Error getting document:", error);
    // })

    // friends : {id: name}
    friends = new Object()
    db.collection("users").doc(userID).collection('Friends').get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        friends[doc.id] = doc.data().Name
      });
      this.setState({friends:friends})
<<<<<<< HEAD

      // freeFriends : {id: [day]{friendid : name}}
      // freeFriends : {id: [time]{friendid : name}}

    for (key of Object.keys(friends)) {
      let temp = key;
      fdRef = db.collection("users").doc(temp).collection('FreeFriends').doc(this.props.dayOfWeek);
      fdRef.get().then(doc => {
        if (doc.exists) {
          // console.log("EXISTS",friends[temp],this.props.dayOfWeek)
          freeFriends = this.state.freeFriends
          freeFriends[temp] = doc.data().Freefriends;
          this.setState({freeFriends:freeFriends})
          }
          else {
           // console.log("Does not exist")
          }
        })
      }
=======
>>>>>>> 6d5155a01ad49828ca74899317c2075e5c001f15
  });
}

  updateStateSelected = (id) => {
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
<<<<<<< HEAD
  };

  updateStateFreeFriends = (id) => {
    // selected.set(id, !selected.get(id)); // toggle

    // update all your friends that you're free / not free on tap
    freeFriends = Object.assign(this.state.freeFriends)
    for (key of Object.keys(this.state.friends)) {
      if (key in freeFriends) {
        if (userID in freeFriends[key][id]) {
          delete freeFriends[key][id][userID];
        }
        else {
          // store name but it's not necessary
          if (this.state.selected[id] === 1)
          freeFriends[key][id][userID] = userName;
        }
      }
      else {
        // initialize empty array (time) of arrays
        freeFriends[key] = []
        for (i = 0; i < 25; i++) {
          freeFriends[key].push({})
        }
        if (this.state.selected[id] === 1)
          freeFriends[key][id][userID] = userName;
      }
    }
    return {freeFriends:freeFriends};
=======
>>>>>>> 6d5155a01ad49828ca74899317c2075e5c001f15
  };

  _onPressItem = (id: int) => {
    // updater functions are preferred for transactional updates
    this.setState(this.updateStateSelected(id), () => {
      // console.log(this.state.selected);
      // console.log(this.state.freeFriends);
      // console.log(this.state.friends)
      // console.log(userID);

      // merge
      var setWithMerge = this.userRef.set({
      Freetime: this.state.selected
<<<<<<< HEAD
    }, { merge: true }).then(

            this.setState(this.updateStateFreeFriends(id), ()=>{
              for (friendID of Object.keys(this.state.freeFriends)) {
                //console.log(friendID)
                fdRef = db.collection("users").doc(friendID).collection('FreeFriends').doc(this.props.dayOfWeek)
                console.log(this.state.freeFriends[friendID])
                fdRef.set({
                  Freefriends: this.state.freeFriends[friendID]
                }, {merge: true});
              }
            })
    );


=======
      }, { merge: true });

      // for each friend updates newfreefriends
      for (friendID of Object.keys(this.state.friends)) {
        //console.log(friendID)
        fdRef = db.collection("users").doc(friendID).collection('NewFreeFriends').doc(this.props.dayOfWeek)
        // console.log(this.state.freeFriends[friendID])
        newRef = "Freefriends" + "." + id + "." + userID
        foo = new Object();
        console.log(newRef);

        if (!fdRef.exists) 
          fdRef.set({Freefriends:{}})
        foo[newRef] = this.state.selected[id] == 1 ? true : false;
        fdRef.update(foo);
      }
>>>>>>> 6d5155a01ad49828ca74899317c2075e5c001f15
    })



    //this.setState(this.updateState2()
  }

  _renderItem = ({item}) => (
    // if (this.state.selected[index] == true)
    //   return <Button backgroundColor='green' onPress={this._onPressItem.bind(this, item.key)} title={item.time}/>
    // else
    //   return <Button onPress={this._onPressItem.bind(this, item.key)} title={item.time}/>
    <MyListItem
      id={item.key}
      onPressItem={(id) => {
        this._onPressItem(id)
      }}
      selected={this.state.selected[item.key]}
      title={item.time}
    />
  );
slowStuff() {

  return null
}
  render() {
    // merge for each friend you have

    //console.log(this.state.selected);
    // console.log(this.state.freeFriends);
    //console.log(this.state.friends)
    return (
<View>
      <FlatList
        data={this.props.data}
        extraData={this.state}
        // keyExtractor={this._keyExtractor}
        renderItem={this._renderItem}
      />
      {this.slowStuff()}
    </View>
    );
  }
}
