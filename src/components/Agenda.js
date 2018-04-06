import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet
} from 'react-native';
import {Agenda} from 'react-native-calendars';
import firebase from "../config/firebase";
import { userName, userID } from '../screens/SignInScreen';
// const userID = '10210889686788547'
const db = firebase.firestore();

export default class AgendaScreen extends Component {
  constructor(props) {
    super(props);
    today = new Date()
    items = new Object()
    for (i=0; i < 7; i++) {
      items[this.addDays(today, i)] = []
    }
    this.state = {
      items: items
    }
  }

  addDays = (date, days) => {
  var dat = new Date(date);
  dat.setDate(dat.getDate() + days);
  return this.convertDate(dat.toLocaleDateString());
  }

  componentDidMount() {
    db.collection("users").doc(userID).collection('Meals')
    .onSnapshot((querySnapshot) => {
        meals = [];
        querySnapshot.forEach((doc) => {
            meals.push(doc.data())
        });
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
      month = '0'+entries[0]
    } else {
      month = entries[0]
    }
    if (entries[1] < 10) {
      day = '0'+entries[1]
    } else {
      day = entries[1]
    }
    return (entries[2] + '-'+month+'-'+day)
  }

  updateItems(meals) {
    items = new Object();
    for (meal of meals) {
      day = meal['Day']
      console.log(day)
      dateID = this.convertDate(day.toLocaleDateString())
      console.log(dateID)
      if (dateID in items) {
        mealItems = items[dateID]
      } else {
        mealItems = []
      }

      mealEntry = new Object()
      mealEntry['text'] = `Meal with ${meal['FriendName']}`
      mealEntry['subtext'] = `${meal['Time']} at ${meal['Location']}`
      // mealEntry['height'] = height
      mealItems.push(mealEntry)

      items[dateID] = mealItems
      // console.log(mealItems)
    }
    // console.log(items)
    // console.log(this.state.items)
    updatedItems = new Object()
    for (dateID in this.state.items) {
      if (dateID in items) {
        updatedItems[dateID] = items[dateID]
      } else {
      updatedItems[dateID] = this.state.items[dateID]
      }
    }
    // Object.assign({}, this.state.items, items)
    console.log(updatedItems)
    this.setState((prevState) => { return{items:updatedItems}});
    console.log(this.state.items)
  }

  // getMeals = (id) => {
  //   return new Promise(resolve => {
  //     meals = new Object()
  //     today = new Date()
  //     db.collection("users").doc(id).collection('Meals').where("Day", ">=", today.valueOf()).get().then((querySnapshot) => {
  //         querySnapshot.forEach((doc) => {
  //           console.log(doc.data()['Day'])
  //           meals[doc.id] = doc.data()
  //         });
  //       resolve(meals);
  //     });
  //   })
  // }



  render() {
    today = new Date()
    minDate = today.toISOString().substring(0,10)
    maxDate = this.addDays(today, 6)
    return (
      <Agenda
        items={this.state.items}
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
        renderItem={this.renderItem.bind(this)}
        renderEmptyDate={this.renderEmptyDate.bind(this)}
        // renderDay={(day, item) => {return (<View />);}}
        // renderEmptyData = {() => {return (<View />);}}
        rowHasChanged={this.rowHasChanged.bind(this)}
        onDayPress={(day)=>{console.log('day pressed')}}
        onDayChange={(day)=>{console.log('day changed')}}
        hideKnob={true}

        // markingType={'period'}
        // markedDates={{
        //    '2017-05-08': {textColor: '#666'},
        //    '2017-05-09': {textColor: '#666'},
        //    '2017-05-14': {startingDay: true, endingDay: true, color: 'blue'},
        //    '2017-05-21': {startingDay: true, color: 'blue'},
        //    '2017-05-22': {endingDay: true, color: 'gray'},
        //    '2017-05-24': {startingDay: true, color: 'gray'},
        //    '2017-05-25': {color: 'gray'},
        //    '2017-05-26': {endingDay: true, color: 'gray'}}}
         // monthFormat={'yyyy'}
         // theme={{calendarBackground: 'red', agendaKnobColor: 'green'}}
        //renderDay={(day, item) => (<Text>{day ? day.day: 'item'}</Text>)}
      />
    );
  }

  loadItems(day) {
    console.log(day.dateString);
    // setTimeout(() => {
    //   for (let i = -15; i < 85; i++) {
    //     const time = day.timestamp + i * 24 * 60 * 60 * 1000;
    //     const strTime = this.timeToString(time);
    //     if (!this.state.items[strTime]) {
    //       this.state.items[strTime] = [];
    //       const numItems = Math.floor(Math.random() * 5);
    //       for (let j = 0; j < numItems; j++) {
    //         this.state.items[strTime].push({
    //           name: 'Item for ' + strTime,
    //           height: Math.max(50, Math.floor(Math.random() * 150))
    //         });
    //       }
    //     }
    //   }
    //   //console.log(this.state.items);
    //   const newItems = {};
    //   Object.keys(this.state.items).forEach(key => {newItems[key] = this.state.items[key];});
    //   this.setState({
    //     items: newItems
    //   });
    // }, 1000);
    // console.log(`Load Items for ${day.year}-${day.month}`);
  }

  renderItem(item) {
    return (
      <View style={[styles.item, {height: item.height}]}><Text>{item.text}</Text><Text>{item.subtext}</Text></View>
    );
  }

  renderEmptyDate() {
    return (
      <View style={styles.emptyDate}><Text>No meals scheduled</Text></View>
    );
  }

  rowHasChanged(r1, r2) {
    return r1.name !== r2.name;
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
    flex:1,
    paddingTop: 30
  }
});
