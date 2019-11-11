# grafana-to-excel


### Query structure

The request body for '/api/datasources/proxy/7/_msearch' must be in the below given format


{"search_type":"query_then_fetch","ignore_unavailable":true,"index":"kibana*"}
{"size":0,"query":{"bool":{"filter":[{"range":{"timestamp":{"gte":"1573182560118","lte":"1573204160118","format":"epoch_millis"}}},{"query_string":{"analyze_wildcard":true,"query":"*"}}]}},"aggs":{"2":{"terms":{"field":"DestAirportID","size":10,"order":{"_key":"desc"},"min_doc_count":1},"aggs":{"1":{"max":{"field":"AvgTicketPrice"}},"3":{"min":{"field":"AvgTicketPrice"}}}}}}

>The **aggs** values can be accesed from the response in 'api/dashboards/uid/' 
