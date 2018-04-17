import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView
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
        <Button
          disabled={true}
          title={`${this.props.title}`}
          color = {'black'}
          disabledStyle={{backgroundColor:"#ff7675"}}/>
      )
    }
    if (this.props.selected === 1) {
      return (
        <Button
          onPress={this._onPress}
          title={this.props.title}
          backgroundColor="#55efc4"
          color = {'black'}/>
      )
    }
    return (
      <Button
        onPress={this._onPress}
        title={this.props.title}
        backgroundColor="#dfe6e9"
        color = {'black'}/>
    )

  }
}

export default class FlatListSelector extends React.PureComponent {
  userRef = db.collection('users').doc(userID).collection('Freetime').doc(this.props.dayOfWeek);

  constructor(props) {
    super(props);

    this.state = {selected: [], friends: {}, breakfast: false, latemeal:false, lunch: true, dinner: true}
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

  onBreakfastPress = () => {
  this.setState({breakfast: !this.state.breakfast})
}
  onLateMealPress = () => {
    this.setState({latemeal: !this.state.latemeal})
  }

  render() {
    //console.log(this.state.selected);
    // console.log(this.state.freeFriends);
    //console.log(this.state.friends)
    return (
      <View style={{flex:1,}}>
        <View style={{flex:1}} >
          <Button
            color = {'black'}
            onPress={this.onBreakfastPress}
            transparent
            containerViewStyle = {{ flex:1, marginTop:5, marginBottom:0, paddingBottom:0}}
            textStyle={{fontWeight:'normal', fontSize:18, textAlign:'center', paddingBottom:0, marginBottom:0}}
            rightIcon={{name: this.state.breakfast ? 'md-arrow-dropdown-circle' : 'md-arrow-dropleft-circle', color:'black', type: 'ionicon'}}
            title='Breakfast' />
        {(this.state.breakfast) &&
          <View style={{}}>
            <FlatList
              scrollEnabled = {false}
              data={this.props.data.slice(0,8)}
              extraData={this.state}
              renderItem={this._renderItem}
            />
          </View>
        }
      </View>
        <View style={{flex:1}} >
          <Button
            color = {'black'}
            onPress={()=>this.setState({lunch: !this.state.lunch})}
            transparent
            containerViewStyle = {{ marginTop:5, marginBottom:0, paddingBottom:0}}
            textStyle={{fontWeight:'normal', fontSize:18, textAlign:'center', paddingBottom:0, marginBottom:0}}
            rightIcon={{name: this.state.lunch ? 'md-arrow-dropdown-circle' : 'md-arrow-dropleft-circle', color:'black', type: 'ionicon'}}
            title='Lunch' />
          {(this.state.lunch) &&
          <FlatList
            data={this.props.data.slice(8, 13)}
            scrollEnabled = {false}
            extraData={this.state}
            // keyExtractor={this._keyExtractor}
            renderItem={this._renderItem}
          />
        }
        </View>
        <View style={{flex:1}} >

        <Button
          color = {'black'}
          onPress={this.onLateMealPress}
          transparent
          containerViewStyle = {{}}
          textStyle={{fontWeight:'normal', fontSize:18}}
          rightIcon={{name: this.state.latemeal ? 'md-arrow-dropdown-circle' : 'md-arrow-dropleft-circle', color:'black', type: 'ionicon'}}
          title='Late Meal' />
        {/* <TouchableOpacity onPress={this.onLateMealPress} style={{marginTop:15}}>
           <Text style={{textAlign:'center', fontSize:18, color:'#6c5ce7', fontWeight:'bold'}}> Late Meal </Text>
        </TouchableOpacity> */}
        {(this.state.latemeal) &&
          <View style={{}}>
            <FlatList
              scrollEnabled = {false}
              data={this.props.data.slice(13,19)}
              extraData={this.state}
              // keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
            />
          </View>
        }
      </View>

        {/* <View style = {{ marginTop:10}} > */}
        <Button
          color = {'black'}
          onPress={()=>this.setState({dinner: !this.state.dinner})}
          transparent
          containerViewStyle = {{ marginTop:5, marginBottom:0, paddingBottom:0}}
          textStyle={{fontWeight:'normal', fontSize:18, textAlign:'center', paddingBottom:0, marginBottom:0}}
          rightIcon={{name: this.state.dinner ? 'md-arrow-dropdown-circle' : 'md-arrow-dropleft-circle', color:'black', type: 'ionicon'}}
          title='Dinner' />
          {/* <Text style={{textAlign:'center', fontSize:18, fontWeight:'normal', color:'black',}}>Dinner</Text> */}
          {(this.state.dinner) &&
            <View style={{flex:1}}>
          <FlatList
            data={this.props.data.slice(19, 25)}
            extraData={this.state}
            scrollEnabled = {false}
            // keyExtractor={this._keyExtractor}
            renderItem={this._renderItem}
          />
        </View>}
        {/* </View> */}
        {/* </ScrollView> */}
      </View>
    );
  }
}
