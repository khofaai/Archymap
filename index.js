var sitemap = $("#archymap-zone").archymap({
	map: {
		name:"Sitemap demo",
		core:[
			{
				name:"page 1",
				core:[
					{
						name:"page 1.1"
					}
				]
			},
			{
				name:"page 2",
				core:[
					{
						name:"page 2.1",
						core:[
							{
								name:"page 2.1.1",
								core:[
									{
										name:"page 2.1.1.1"
									}
								]
							},
							{
								name:"page 2.1.2",
								core:[
									{
										name:"page 2.1.2.1"
									},
									{
										name:"page 2.1.2.2"
									}
								]
							}
						]
					},
					{
						name:"page 2.2"
					}
				]
			}
		]
	},
	colors:{
		background:['#8a9b8a','#748492','#d89a9a','#e7def2','#fff'],
		text:['#fff','#fff','#fff','#000','#000']
	},
	icons:{
		plus:'zmdi zmdi-plus',
		minus:'zmdi zmdi-minus',
		zoomOut:'zmdi zmdi-time-restore-setting'
	}
});