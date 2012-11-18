describe 'BH.Collections.Weeks', ->
  beforeEach ->
    @weeks = new BH.Collections.Weeks()

  describe '#toTemplate', ->
    it 'returns the properties needed for a view template', ->
      week1 = new BH.Models.Week
        date: moment('Oct 12, 2010')
      spyOn(week1, 'toTemplate').andReturn('templated')

      week2 = new BH.Models.Week
        date: moment('Oct 19, 2010')
      spyOn(week2, 'toTemplate').andReturn('templated again')

      @weeks.add([week1, week2])

      expect(@weeks.toTemplate()).toEqual
        weeks: ['templated', 'templated again']

  describe '#reload', ->
    beforeEach ->
      Timecop.freeze(new Date('10-23-12'))

    afterEach ->
      Timecop.returnToPresent()

    it 'reloads the weeks with the passed starting day', ->
      @weeks.reload('Monday')
      dates = for model in @weeks.models
        model.get('date').format('M-D-YY')
      expect(dates).toEqual [
        '10-22-12', '10-15-12', '10-8-12', '10-1-12', '9-24-12',
        '9-17-12', '9-10-12', '9-3-12', '8-27-12', '8-20-12'
      ]


