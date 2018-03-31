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


class MyListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.id);
  };

  render() {
    const textColor = this.props.selected ? "red" : "black";
    return (
      <TouchableOpacity onPress={this._onPress}>
        <View>
          <Text style={{ color: textColor }}>
            {this.props.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}
export default class FreeTimeSelector extends Component {
  state = {selected: (new Map(): Map<string, boolean>)};

 _keyExtractor = (item, index) => item.id;

 _onPressItem = (id: string) => {
   // updater functions are preferred for transactional updates
   this.setState((state) => {
     // copy the map rather than modifying state.
     const selected = new Map(state.selected);
     selected.set(id, !selected.get(id)); // toggle
     return {selected};
   });
 };

  // constructor(props) {
  //   super(props);
  //   this.state = {selected: []};
  // }
  //
  // onPressTime(time) {
  //   var arr = this.state.selected;
  //   var index = arr.indexOf(time);
  //   if (index > -1) arr.splice(index, 1);
  //   else arr.push(time);
  //   this.setState({selected: arr});
  //   console.log(this.state)
  // }

  _renderItem = ({item}) => (
    <MyListItem
      id={item.id}
      onPressItem={this._onPressItem}
      selected={!!this.state.selected.get(item.id)}
      title={item.key}
  />
);
    // if (this.state.selected.includes(item.key))
    // return <Button backgroundColor= {this.state.selected.includes(item.key) ? 'green' : ''} onPress={this.onPressTime.bind(this, item.key)} title={item.key}/>
    // else
    //   return <Button onPress={this.onPressTime.bind(this, item.key)} title={item.key}/>


  render() {
    return (
      <FlatList
        data={this.props.data}
        extraData={this.state}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem}
      />
      /* <View>
        <FlatList
          data={rows}
          renderItem={this.renderItem}
        />
      </View> */
    )
  }
}
