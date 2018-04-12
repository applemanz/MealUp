import React, {Component} from 'react';
import {Text, View, StyleSheet, Platform, TouchableHighlight, Modal, Button, Image} from 'react-native';
import {Agenda} from 'react-native-calendars';
import firebase from "../config/firebase";
import { userName, userID } from './SignInScreen';
const db = firebase.firestore();

export default class HomeScreen extends Component {
  static navigationOptions = {
    title: 'Meals'
  };

  constructor(props) {
    super(props);
    let items = this.createEmptyData()
    this.state = {
      items: items,
      refreshing: false,
      modal: false,
      mealModal: false,
      mealItem: {},
      curMeal: "",
      displaydate: "hello",
    }
  }

  componentDidMount() {
    this.props.navigation.addListener('willFocus', ()=>{
      this.onRefresh();
    });
    console.log(userID)
    db.collection("users").doc(userID).collection('Meals').onSnapshot((querySnapshot) => {
      meals = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().DateTime >= new Date()) {
          meals.push(doc.data());
          meals[meals.length-1]['docid'] = doc.id;
          //console.log("SETTING DOCID TO " + meals[meals.length-1] + " " + doc.id);
        } else {
          //console.log("MEAL HAS PASSED: " + doc.data().DateTime);
          // TODO convert meal back to freetime in array
          db.collection("users").doc(userID).collection('Meals').doc(doc.id).delete().then(() => {
            //console.log("Document successfully deleted!");
            db.collection("users").doc(doc.data().FriendID).collection('Meals').doc(doc.id).delete()
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          });
        }
      });
      if (meals.length == 0) {
        updatedItems = this.createEmptyData()
        this.setState((prevState) => {
          return {items: updatedItems}
        });
      }
      //console.log(meals)
      this.updateItems(meals);

    });
  }

  createEmptyData = () => {
    today = new Date()
    emptyItems = new Object()
    for (i = 0; i < 7; i++) {
      emptyItems[this.addDays(today, i)] = []
    }
    return emptyItems
  }

  addDays = (date, days) => {
    var dat = new Date(date);
    dat.setDate(dat.getDate() + days);
    dateStr = Platform.OS === 'ios' ? this.convertDate(dat.toLocaleDateString('en-US')) : this.convertDateAndroid(dat.toLocaleDateString('en-US'))
    return dateStr
  }

  // formatTimeString(Day, length) {
    // timeStr = ""
    // entries = Day.split(" ")
    // console.log(entries)
    // amPM = entries[1]
    // times = entries[0].split(":")
    // if (length == 1) {
    //   timeStr = time[0]+":"+times[1]
    // } else {
    //   timeStr = ""
    // }
    //   min = date.getMinutes()
    //   if (min == 0) {min = ':00'}
    //   else {min = ':30'}
    //   hr = date.getHours()
    //   timeStr = ""
    //   if (hr > 12) {
    //     timeStr = (hr - 12) + min + ' PM'
    //   } else if (hr == 12) {
    //   } else {
    //     timeStr = hr+min+' AM'
    //   }
    //   return timeStr
    // }

  convertDate = (date) => {
    entries = date.split("/")
    if (entries[0] < 10) {
      month = '0' + entries[0]
    } else {
      month = entries[0]
    }
    if (entries[1] < 10) {
      day = '0' + entries[1]
    } else {
      day = entries[1]
    }
    return (entries[2] + '-' + month + '-' + day)
  }

  convertDateAndroid = (date) => {
    entries = date.split("/")
    return ('20'+entries[2]+'-'+entries[0]+'-'+entries[1])
  }

  updateItems = (meals) => {
    var items = new Object();
    for (meal of meals) {
      var Day = meal['DateTime']
      dateID = Platform.OS === 'ios' ? this.convertDate(Day.toLocaleDateString('en-US')) : this.convertDateAndroid(Day.toLocaleDateString('en-US'))
      if (dateID in items) {
        mealItems = items[dateID]
      } else {
        mealItems = []
      }
      mealEntry = new Object()
      mealEntry['text'] = `Meal with ${meal['FriendName']}`
      mealEntry['subtext'] = `${meal['TimeString']} at ${meal['Location']}`
      mealEntry['docid'] = meal['docid']
      //console.log("HERE" + meal['docid'])
      mealEntry['meal'] = meal
      mealEntry['displaydate'] = meal.DateTime.toDateString().substring(0,10);
      mealItems.push(mealEntry)
      items[dateID] = mealItems
    }
    console.log('in update meals')
    //console.log(items)
    updatedItems = this.createEmptyData()

    for (dateID in updatedItems) {
      if (dateID in items) {
        updatedItems[dateID] = items[dateID]
        //console.log("DOCID " + items[dateID][0].displaydate)
      }
    }
    //console.log(updatedItems)
    this.setState((prevState) => {
      return {items: updatedItems}
    });
  }

  onRefresh = () => {
    this.setState({refreshing: true});
    db.collection("users").doc(userID).collection('Meals').onSnapshot((querySnapshot) => {
      meals = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().DateTime >= new Date()) {
          meals.push(doc.data());
          meals[meals.length-1]['docid'] = doc.id;
        } else {
          //console.log("MEAL HAS PASSED: " + doc.data().DateTime);
          // TODO convert meal back to freetime in array
          db.collection("users").doc(userID).collection('Meals').doc(doc.id).delete().then(() => {
            //console.log("Document successfully deleted!");
            db.collection("users").doc(doc.data().FriendID).collection('Meals').doc(doc.id).delete()
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          });
        }
      });
      if (meals.length == 0) {
        updatedItems = this.createEmptyData()
        this.setState((prevState) => {
          return {items: updatedItems}
        });
      }
      //console.log(meals)
      //console.log("M0 " + meals[0].docid);
      this.updateItems(meals);
      //console.log("M01 " + meals[0].docid);
    });
    this.setState({refreshing: false});
  }

  render() {
    today = new Date()
    // console.log(today)
    // console.log("converted today", this.convertDate(today.toLocaleDateString('en-US')))
    minDate = Platform.OS === 'ios' ? this.convertDate(today.toLocaleDateString('en-US')) : this.convertDateAndroid(today.toLocaleDateString('en-US'))
    maxDate = this.addDays(today, 7)
    // console.log("Maxdate", maxDate)
    console.log('in render')
    //console.log(this.state.items)
    return (
      <View style={{flex: 1}}>
      <Agenda items={this.state.items}
        refreshing={this.state.refreshing}
        onRefresh={this.onRefresh}
        // loadItemsForMonth={this.loadMeals.bind(this)}
        selected={minDate}
        // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
        minDate={minDate}
        // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
        maxDate={maxDate}
        // Max amount of months allowed to scroll to the past. Default = 50
        pastScrollRange={2}
        // Max amount of months allowed to scroll to the future. Default = 50
        futureScrollRange={2}
        renderItem={this.renderItem}
        renderEmptyDate={this.renderEmptyDate.bind(this)}
        rowHasChanged={this.rowHasChanged.bind(this)}
        hideKnob={false}
        theme={{
          backgroundColor: 'transparent',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#f4511e',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#f4511e',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#00adf5',
          selectedDotColor: '#ffffff',
          arrowColor: 'orange',
          monthTextColor: 'blue',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16,
          // agendaDayTextColor: 'yellow',
          // agendaDayNumColor: 'green',
          agendaTodayColor: '#f4511e',
        }}
      />
      {this.modal()}
      {this.mealModal()}
    </View>
    )
  }

  itemPressed = (item) => {
    this.setState({mealModal: true, curMeal: item.docid, displaydate: item.displaydate, mealItem: item.meal});
  }

  renderItem = (item) => {
    //console.log(item.docid);
    return (
      <TouchableHighlight onPress={() => this.itemPressed(item)} underlayColor='transparent'>
      <View style={[styles.item, {height: item.height}]}>
        <Text>{item.text}</Text>
        <Text>{item.subtext}</Text>
      </View>
      </TouchableHighlight>
    );
  }
  requestPressed = () => {
    this.setState({modal: true});
  }

  renderEmptyDate() {
    return (
        <TouchableHighlight onPress={this.requestPressed} underlayColor='transparent'>
        <View style={[styles.empty, {height: 40}]}>
          <Text>No meals scheduled. Schedule a meal?</Text>
        </View>
        </TouchableHighlight>
    );
  }

  rowHasChanged(r1, r2) {
    return r1 !== r2;
  }

  RequestByFriend = () => {
    this.setState({modal: false});
    this.props.navigation.navigate('RequestByFriend');
  }

  RequestByTime = () => {
    this.setState({modal: false});
    this.props.navigation.navigate('RequestByTime');
  }

  modal() {
    return <View>
    <Modal onRequestClose={() => this.setState({modal: false})} transparent={true} visible={this.state.modal}>
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'}}>
        <View style={{
          width: 300,
          height: 300,
          backgroundColor: '#fff', padding: 20}}>
          <View style={{padding: 15}}>
            <Button onPress={this.RequestByFriend} title="Request by Friend"/>
          </View>
          <View style={{padding: 15}}>
            <Button onPress = {this.RequestByTime} title="Request by Time"/>
          </View>
          <View style={{padding: 25, alignItems: 'center'}}>
            <TouchableHighlight style={{padding: 10, backgroundColor: "#DDDDDD", borderRadius: 5}}
              onPress={() => this.setState({modal: false})}>
              <Text style={{fontSize: 15, textAlign: 'right'}}>Cancel</Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    </Modal>
  </View>;
  }

  rescheduleMeal = () => {
    console.log("reschedule " + this.state.curMeal);
    this.setState({mealModal: false})
    this.props.navigation.navigate('FriendChosen', {
      sent: 2,
      reschedule: this.state.curMeal,
      name: this.state.mealItem.FriendName,
      id: this.state.mealItem.FriendID,
      url: `http://graph.facebook.com/${this.state.mealItem.FriendID}/picture?type=large`
    });
  }
  cancelRequest = () => {
    console.log("canceling " + this.state.curMeal)
    db.collection("users").doc(userID).collection('Meals').doc(this.state.curMeal).delete().then(() => {
      console.log("Document successfully deleted!");
      db.collection("users").doc(this.state.mealItem.FriendID).collection('Meals').doc(this.state.curMeal).delete()
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });
    this.setState({mealModal: false})
  }

mealModal() {
  return <View>
  <Modal onRequestClose={() => this.setState({mealModal: false})} transparent={true} visible={this.state.mealModal}>
    <View style={{
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#00000080'}}>
    <View style={{
        width: 300,
        height: 400,
        backgroundColor: '#fff', padding: 20}}>
        <View style={{alignItems: 'center'}}>
        <View style={{padding: 10}}>
        <Image
          style={{width: 100, height: 100, borderRadius: 50}}
          source={{uri: `http://graph.facebook.com/${this.state.mealItem.FriendID}/picture?type=large`}}
        />
        </View>
      <View style={{padding: 10}}>
              <Text>{this.state.mealItem.FriendName}</Text>
      </View>
      <View style={{padding: 10}}>
      <Text>{this.state.displaydate} {this.state.mealItem.TimeString} at {this.state.mealItem.Location}</Text>
      </View>
      </View>
      <View style={{padding: 10}}>
        <TouchableHighlight style={{padding: 10, backgroundColor: "#d9534f", borderRadius: 5}}
          onPress={this.cancelRequest}>
          <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Cancel Meal</Text>
        </TouchableHighlight>
      </View>
      <View style={{padding: 10}}>
        <TouchableHighlight style={{padding: 10, backgroundColor: "#ffbb33", borderRadius: 5}}
          onPress={this.rescheduleMeal}>
          <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Reschedule Meal</Text>
        </TouchableHighlight>
      </View>
      <View style={{padding: 15, alignItems: 'center'}}>
        <TouchableHighlight style={{padding: 10, backgroundColor: "#DDDDDD", borderRadius: 5}}
          onPress={() => this.setState({mealModal: false})}>
          <Text style={{fontSize: 15, fontWeight: 'bold', textAlign: 'center'}}>Cancel</Text>
        </TouchableHighlight>
      </View>
      </View>
      </View>
    </Modal>
  </View>;
  }
}


const styles = StyleSheet.create({
  item: {
    backgroundColor: '#f9a56a',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
  empty: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
});
