import React, {Component} from 'react';
import {Text, View, StyleSheet, Platform, TouchableHighlight, Modal, Button, Image} from 'react-native';
import {Agenda} from 'react-native-calendars';
import firebase from "../config/firebase";
import { userName, userID } from './SignInScreen';
const db = firebase.firestore();

const data_flip = {'7:30 AM': 0, '8:00 AM': 1, '8:30 AM': 2, '9:00 AM': 3, '9:30 AM': 4, '10:00 AM': 5, '10:30 AM': 6,
'11:00 AM': 7, '11:30 AM': 8, '12:00 PM': 9, '12:30 PM': 10, '1:00 PM': 11, '1:30 PM': 12, '2:00 PM': 13, '2:30 PM': 14,
'3:00 PM': 15, '3:30 PM': 16, '4:00 PM': 17, '4:30 PM': 18, '5:00 PM': 19, '5:30 PM': 20, '6:00 PM': 21, '6:30 PM': 22,
'7:00 PM': 23, '7:30 PM': 24}
const weekdays = [
{key:0, day:'Sunday'}, {key:1, day:'Monday'}, {key:2, day:'Tuesday'}, {key:3, day:'Wednesday'}, {key:4, day:'Thursday'},
{key:5, day:'Friday'}, {key:6, day:'Saturday'}
]

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
    this.cancelRequest = this.cancelRequest.bind(this)
  }

  componentDidMount() {
    this.props.navigation.addListener('willFocus', ()=>{
      this.onRefresh();
    });
    // console.log(userID)
    db.collection("users").doc(userID).collection('Meals').onSnapshot((querySnapshot) => {
      meals = [];
      querySnapshot.forEach((doc) => {
        today = new Date()
        today.setHours(0, 0, 0, 0)
        if (doc.data().DateTime >= today) {
          meals.push(doc.data());
          meals[meals.length-1]['docid'] = doc.id;
          //console.log("SETTING DOCID TO " + meals[meals.length-1] + " " + doc.id);
        } else {
          //console.log("MEAL HAS PASSED: " + doc.data().DateTime);
          // TODO convert meal back to freetime in array
          weekday = weekdays[doc.data().DateTime.getDay()].day
          freetimeRef = db.collection("users").doc(userID).collection('Freetime').doc(weekday);
          freetimeRef.get().then(function(doc) {
            freetimeData = doc.data();
            for (i = 0; i < freetimeData['Freetime'].length; i++) {
              if (freetimeData['Freetime'][i] === 2) {
                freetimeData['Freetime'][i] = 1
              }
            }
          freetimeRef.set(freetimeData).then(() => {
            // console.log("My Document updated");
            })
            .catch(function(error) {
              // console.error("Error updating", error);
            });
          })
          db.collection("users").doc(userID).collection('Meals').doc(doc.id).delete().then(() => {
            //console.log("Document successfully deleted!");
            db.collection("users").doc(doc.data().FriendID).collection('Meals').doc(doc.id).delete()
          }).catch(function(error) {
            // console.error("Error removing document: ", error);
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
      if (meal['isGroup'] === true) {
        // TODO: get group member names
      } else {
        mealEntry['text'] = meal['FriendName'].split(" ")[0]
      }
      mealEntry['subtext'] = `${meal['TimeString']} at ${meal['Location']}`
      mealEntry['docid'] = meal['docid']
      mealEntry['url'] = `http://graph.facebook.com/${meal['FriendID']}/picture?type=large`
      //console.log("HERE" + meal['docid'])
      mealEntry['meal'] = meal
      mealEntry['displaydate'] = meal.DateTime.toDateString().substring(0,10);
      mealEntry['datetime'] = meal.DateTime;
      mealItems.push(mealEntry)
      items[dateID] = mealItems
    }
    // console.log('in update meals')
    //console.log(items)
    updatedItems = this.createEmptyData()

    for (dateID in updatedItems) {
      if (dateID in items) {
        items[dateID].sort(function(a, b) {
          a = a.datetime;
          b = b.datetime;
          return a>b ? 1 : a<b ? -1 : 0;
        });
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
        today = new Date()
        today.setHours(0, 0, 0, 0)
        if (doc.data().DateTime >= today) {
          meals.push(doc.data());
          meals[meals.length-1]['docid'] = doc.id;
        } else {
          //console.log("MEAL HAS PASSED: " + doc.data().DateTime);
          // TODO convert meal back to freetime in array
          weekday = weekdays[doc.data().DateTime.getDay()].day
          freetimeRef = db.collection("users").doc(userID).collection('Freetime').doc(weekday);
          freetimeRef.get().then(function(doc) {
            freetimeData = doc.data();
            for (i = 0; i < freetimeData['Freetime'].length; i++) {
              if (freetimeData['Freetime'][i] === 2) {
                freetimeData['Freetime'][i] = 1
              }
            }
          freetimeRef.set(freetimeData).then(() => {
            // console.log("My Document updated");
            })
            .catch(function(error) {
              // console.error("Error updating", error);
            });
          })
          db.collection("users").doc(userID).collection('Meals').doc(doc.id).delete().then(() => {
            //console.log("Document successfully deleted!");
            db.collection("users").doc(doc.data().FriendID).collection('Meals').doc(doc.id).delete()
          }).catch(function(error) {
            // console.error("Error removing document: ", error);
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
    // console.log('in render')
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
      <TouchableHighlight style={{marginTop:17,}} onPress={() => this.itemPressed(item)} underlayColor='transparent'>
      <View style={[styles.item, {height: item.height, flexDirection:'row'}]}>
        <Image
          style={{width: 35, height: 35, borderRadius: 17.5, marginRight:10}}
          source={{uri: item.url}}
        />
        <View>
          <Text style = {{fontSize:15}}>{item.text}</Text>
          <Text style = {{fontSize:15}}>{item.subtext}</Text>
        </View>
      </View>
      </TouchableHighlight>
    );
  }
  requestPressed = () => {
    this.setState({modal: true});
  }

  renderEmptyDate() {
    return (
        <TouchableHighlight onPress={this.requestPressed} style={{marginTop:20}} underlayColor='transparent'>
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
    // console.log("reschedule " + this.state.curMeal);
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
    // TODO: free up the freetimes
    console.log(this.state.curMeal)
    curMeal = this.state.curMeal
    curMealRef = db.collection("users").doc(userID).collection('Meals').doc(this.state.curMeal)
    curMealRef.get().then(function(doc) {
      if (!doc.exists) {
        console.log("No such document!");
      } else {
        curMealRefData = doc.data();
        if (curMealRefData && curMealRefData['DateTime']) {
          weekday = weekdays[curMealRefData['DateTime'].getDay()].day
          amPM = curMealRefData['DateTime'].getHours() >= 12 ? "PM" : "AM"
          hours = (curMealRefData['DateTime'].getHours() % 12 || 12) + ":" + ("0" + curMealRefData['DateTime'].getMinutes()).slice(-2) + " " + amPM
          index = data_flip[hours]

          // update freetimes
          freetimeRef = db.collection("users").doc(userID).collection('Freetime').doc(weekday);
          freetimeRef.get().then(function(doc) {
            freetimeData = doc.data();
            freetimeData['Freetime'][index] = 1
              if (curMealRefData['Length'] === 1) {
                freetimeData['Freetime'][index+1] = 1
              }
          // console.log("my data", freetimeData)
          freetimeRef.update(freetimeData).then(() => {
            console.log("My Document updated");
            })
            .catch(function(error) {
              console.error("Error updating", error);
            });
          })

          if (curMealRefData["isGroup"] === true) {
            for (let thisid in curMealRefData["members"]) {
              freetimeRef_other = db.collection("users").doc(thisid).collection('Freetime').doc(weekday);
              freetimeRef_other.get().then(function(doc) {
              freetimeData_other = doc.data();
              freetimeData_other['Freetime'][index] = 1
                if (curMealRefData['Length'] === 1) {
                  freetimeData_other['Freetime'][index+1] = 1
                }
               // console.log(freetimeData_other)
               freetimeRef_other.update(freetimeData_other).then(() => {
              console.log("Document updated");
              })
              .catch(function(error) {
                console.error("Error updating", error);
              });
            })
            }
          } else {
            freetimeRef_other = db.collection("users").doc(curMealRefData["FriendID"]).collection('Freetime').doc(weekday);
            freetimeRef_other.get().then(function(doc) {
              freetimeData_other = doc.data();
              freetimeData_other['Freetime'][index] = 1
                if (curMealRefData['Length'] === 1) {
                  freetimeData_other['Freetime'][index+1] = 1
                }
            // console.log(freetimeData_other)
            freetimeRef_other.update(freetimeData_other).then(() => {
              console.log("Document updated");
              })
              .catch(function(error) {
                console.error("Error updating", error);
              });
            })
          }
        }
      console.log("canceling " + curMeal)
      db.collection("users").doc(userID).collection('Meals').doc(curMeal).delete().then(() => {
        console.log("Document successfully deleted!");
        db.collection("users").doc(curMealRefData["FriendID"]).collection('Meals').doc(curMeal).delete()
      }).catch(function(error) {
        console.error("Error removing document: ", error);
      });
      } 
    }).catch(function(error) {
       console.error("Error updating freetime: ", error);
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
        height: 420,
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
