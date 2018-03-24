import React from 'react';
import { View, Text, FlatList} from 'react-native';
import { Button } from 'react-native-elements';

export default class FreeTimeScreen extends React.Component {

  static navigationOptions = {
    title: 'Free Time',
  };

  constructor(props) {
    super(props);
    this.state = {selected: []};
  }

  onPressTime(time) {
    var arr = this.state.selected;
    var index = arr.indexOf(time);
    if (index > -1) arr.splice(index, 1);
    else arr.push(time);
    this.setState({selected: arr});
  }

  renderItem = ({item, index}) => {
    if (this.state.selected.includes(item.key)) return <Button backgroundColor='green' onPress={this.onPressTime.bind(this, item.key)} title={item.key}/>
    else return <Button onPress={this.onPressTime.bind(this, item.key)} title={item.key}/>
  }

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <FlatList
          data={[{key: '7:30'}, {key: '8:00'}, {key: '8:30'},
                 {key: '9:00'}, {key: '9:30'}, {key: '10:00'}, {key: '10:30'},
                 {key: '11:00'}, {key: '11:30'}, {key: '12:00'}, {key: '12:30'},
                 {key: '1:00'}, {key: '1:30'}, {key: '2:00'}, {key: '2:30'},
                 {key: '3:00'}, {key: '3:30'}, {key: '4:00'}, {key: '4:30'},
                 {key: '5:00'}, {key: '5:30'}, {key: '6:00'}, {key: '6:30'},
                 {key: '7:00'}]}
          renderItem={this.renderItem}
        />
      </View>
    );
  }
}
