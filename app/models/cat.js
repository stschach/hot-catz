import DS from 'ember-data';

export default DS.Model.extend({
  imageUrl: DS.attr('string'),
  name: DS.attr('string'),
  rank: DS.attr('number', {defaultValue: 0}),
  votes: DS.attr('number', {defaultValue: 0})
});
