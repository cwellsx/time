rem GraphViz is on my machine but not on my PATH so specify its location here
set GRAPHVIZ=C:\Users\Christopher\Source\Repos\graphviz-2.38\release\bin
call %GRAPHVIZ%\dot .\dependencies.dot -Tpng -o.\dependencies.png

findstr /V "dotted" "dependencies.dot" > "dependencies_2.dot"
call %GRAPHVIZ%\dot .\dependencies_2.dot -Tpng -o.\dependencies_2.png
