import React, {Component} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {Agenda} from 'react-native-calendars';
import firebase from "../config/firebase";
import { userName, userID } from '../screens/SignInScreen';
const db = firebase.firestore();

export default class AgendaScreen extends Component {
  constructor(props) {
    super(props);
    let items = this.createEmptyData()
    this.state = {
      items: items
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
    return this.convertDate(dat.toLocaleDateString());
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
      this.updateItems(meals);
    });
  }

  // formatTimeString(date, length) {
  // timeStr = ""
  // entries = date.split(" ")
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

  updateItems = (meals) => {
    var items = new Object();
    for (meal of meals) {
      day = meal['Day']
      dateID = this.convertDate(day.toLocaleDateString())
      if (dateID in items) {
        mealItems = items[dateID]
      } else {
        mealItems = []
      }

      mealEntry = new Object()
      mealEntry['text'] = `Meal with ${meal['FriendName']}`
      mealEntry['subtext'] = `${meal['Time']} at ${meal['Location']}`
      mealItems.push(mealEntry)

      items[dateID] = mealItems
    }

    updatedItems = this.createEmptyData()

    for (dateID in updatedItems) {
      if (dateID in items) {
        updatedItems[dateID] = items[dateID]
      }
    }
    this.setState((prevState) => {
      return {items: updatedItems}
    });
  }

  render() {
    today = new Date()
    minDate = today.toISOString().substring(0, 10)
    maxDate = this.addDays(today, 6)
    return (
        <Agenda items={this.state.items}
        // loadItemsForMonth={this.loadMeals.bind(this)}
        selected={minDate}
        // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
        minDate={minDate}
        // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
        maxDate={maxDate}
        // Max amount of months allowed to scroll to the past. Default = 50
        pastScrollRange={1}
        // Max amount of months allowed to scroll to the future. Default = 50
        futureScrollRange={1}
        renderItem={this.renderItem}
        renderEmptyDate={this.renderEmptyDate.bind(this)}
        rowHasChanged={this.rowHasChanged.bind(this)}
        hideKnob={true}
        theme={{        }}
      />
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
