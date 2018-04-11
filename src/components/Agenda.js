import React, {Component} from 'react';
import {Text, View, StyleSheet, Platform} from 'react-native';
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
      refreshing: false
    }
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

  componentDidMount() {
    db.collection("users").doc(userID).collection('Meals').onSnapshot((querySnapshot) => {
      meals = [];
      querySnapshot.forEach((doc) => {
        meals.push(doc.data())
      });
      if (meals.length == 0) {
        updatedItems = this.createEmptyData()
        this.setState((prevState) => {
          return {items: updatedItems}
        });
      }
      console.log(meals)
      this.updateItems(meals);
    });
  }

  // formatTimeString(Day, length) {
  // timeStr = ""
  // entries = Day.split(" ")
  // console.log(entries)
  // amPM = entries[1]
  // times = entries[0].split(":")
  // if times[0]
  // times[1]
  // if (length == 1) {
  //
  //   timeStr = time[0]+":"+times[1]+"-"+
  // } else {
  //
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
    // return timeStr
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
      mealItems.push(mealEntry)
      items[dateID] = mealItems
    }
    console.log('in update meals')
    console.log(items)
    updatedItems = this.createEmptyData()

    for (dateID in updatedItems) {
      if (dateID in items) {
        updatedItems[dateID] = items[dateID]
      }
    }
    console.log(updatedItems)
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
          meals.push(doc.data())
        } else {
          console.log("MEAL HAS PASSED: " + doc.data().DateTime);
          // TODO convert meal back to freetime in array
          db.collection("users").doc(userID).collection('Meals').doc(doc.id).delete().then(() => {
            console.log("Document successfully deleted!");
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
      console.log(meals)
      this.updateItems(meals);
    });
    this.setState({refreshing: false});
  }

  render() {
    today = new Date()
    console.log(today)
    console.log("converted today", this.convertDate(today.toLocaleDateString('en-US')))
    minDate = Platform.OS === 'ios' ? this.convertDate(today.toLocaleDateString('en-US')) : this.convertDateAndroid(today.toLocaleDateString('en-US'))
    maxDate = this.addDays(today, 6)
    console.log("Maxdate", maxDate)
    console.log('in render')
    console.log(this.state.items)
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
        hideKnob={true}
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
    </View>
    )
  }

  renderItem = (item) => {
    return (
      <View style={[styles.item, {height: item.height}]}>
        <Text>{item.text}</Text>
        <Text>{item.subtext}</Text>
      </View>
    );
  }

  renderEmptyDate() {
    return (
      <View style={styles.emptyDate}>
        <Text>No meals scheduled</Text>
      </View>
    );
  }

  rowHasChanged(r1, r2) {
    return r1 !== r2;
  }

  timeToString(time) {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  }
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30
  }
});
